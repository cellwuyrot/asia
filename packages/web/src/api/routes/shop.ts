import { z } from "zod";
import { eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import sharp from "sharp";
import { base } from "../__core/app";
import { admin } from "../middleware/admin";
import { db } from "../database";
import * as s from "../database/schema";
import { productSchema, settingsSchema, type Product } from "../../shared/shop";
import { invalidatePageCache } from "../services/page-seo";
import { captchaRequired } from "../services/order-security";
import { ordersAvailable } from "../services/orders";
async function list() {
  return (await db.select().from(s.products))
    .map((x) => productSchema.parse(JSON.parse(x.data)))
    .sort((a, b) => a.sort - b.sort);
}
async function settings() {
  const [r] = await db.select().from(s.settings).where(eq(s.settings.id, "main"));
  if (!r) throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Выполните db:seed" });
  return settingsSchema.parse(JSON.parse(r.data));
}
function publicProduct(p: Product) {
  return { ...p, cost: 0, priority: "", demand: 0 };
}
export const shop = {
  catalog: base.handler(async () => ({
    products: (await list()).filter((p) => p.active).map(publicProduct),
    settings: await settings(),
    ordersEnabled: await ordersAvailable(),
    captchaSiteKey: captchaRequired() ? process.env.TURNSTILE_SITE_KEY || "" : "",
  })),
};
export const management = {
  me: admin.handler(({ context }) => ({ email: context.user.email })),
  catalog: admin.handler(async () => ({ products: await list(), settings: await settings() })),
  saveProduct: admin.input(productSchema).handler(async ({ input }) => {
    if (
      input.image &&
      !input.image.startsWith("https://") &&
      !/^data:image\/webp;base64,[A-Za-z0-9+/=]+$/.test(input.image)
    )
      throw new ORPCError("BAD_REQUEST", {
        message: "Используйте HTTPS-ссылку или загрузите изображение",
      });
    if (input.oldPrice !== null && input.oldPrice <= input.price)
      throw new ORPCError("BAD_REQUEST", { message: "Старая цена должна быть выше текущей" });
    const all = await list();
    if (input.section !== "bundles" && input.contents.length)
      throw new ORPCError("BAD_REQUEST", { message: "Состав задаётся только для наборов" });
    if (
      input.contents.some(
        (c) =>
          c.productId === input.id ||
          !all.some((p) => p.id === c.productId && p.section !== "bundles"),
      )
    )
      throw new ORPCError("BAD_REQUEST", {
        message: "В составе можно выбрать только существующие отдельные товары",
      });
    if (new Set(input.contents.map((c) => c.productId)).size !== input.contents.length)
      throw new ORPCError("BAD_REQUEST", { message: "В составе повторяется товар" });
    await db
      .insert(s.products)
      .values({ id: input.id, data: JSON.stringify(input) })
      .onConflictDoUpdate({ target: s.products.id, set: { data: JSON.stringify(input) } });
    invalidatePageCache();
    return input;
  }),
  deleteProduct: admin.input(z.object({ id: z.string() })).handler(async ({ input }) => {
    const all = await list();
    if (all.some((p) => p.contents.some((c) => c.productId === input.id)))
      throw new ORPCError("CONFLICT", {
        message: "Товар входит в набор. Уберите его из состава или скройте товар.",
      });
    await db.delete(s.products).where(eq(s.products.id, input.id));
    invalidatePageCache();
    return { ok: true };
  }),
  saveSettings: admin.input(settingsSchema).handler(async ({ input }) => {
    for (const url of [input.telegram, input.vk, input.avito])
      if (url && !url.startsWith("https://"))
        throw new ORPCError("BAD_REQUEST", { message: "Соцсети: используйте HTTPS-ссылки" });
    await db
      .insert(s.settings)
      .values({ id: "main", data: JSON.stringify(input) })
      .onConflictDoUpdate({ target: s.settings.id, set: { data: JSON.stringify(input) } });
    invalidatePageCache();
    return input;
  }),
  upload: admin.input(z.object({ data: z.string().max(3000000) })).handler(async ({ input }) => {
    const m = input.data.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/);
    if (!m) throw new ORPCError("BAD_REQUEST", { message: "Только JPG, PNG или WebP, до 2 МБ" });
    const buffer = Buffer.from(m[2], "base64");
    if (buffer.length > 2 * 1024 * 1024)
      throw new ORPCError("BAD_REQUEST", { message: "Максимальный размер — 2 МБ" });
    try {
      const out = await sharp(buffer, { limitInputPixels: 25000000 })
        .rotate()
        .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      return { image: "data:image/webp;base64," + out.toString("base64") };
    } catch {
      throw new ORPCError("BAD_REQUEST", { message: "Не удалось прочитать изображение" });
    }
  }),
};
