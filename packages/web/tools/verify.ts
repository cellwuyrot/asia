import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { auth } from "../src/api/auth";
import type { AppRouterClient } from "../src/api";
import seed from "../src/shared/catalog-seed.json";
const anon: AppRouterClient = createORPCClient(
  new RPCLink({ url: "http://localhost:4200/api/rpc" }),
);
const pub = await anon.shop.catalog();
if (pub.products.length !== 65 || pub.products.some((p) => p.cost !== 0))
  throw Error("Public catalog safety failed");
for (const p of pub.products) {
  const x = seed.find((i) => i.id === p.id);
  if (!x || x.price !== p.price) throw Error("Price mismatch " + p.id);
}
console.log("PASS: 52 products + 13 bundles, all prices match Excel, costs private");
try {
  await anon.management.saveSettings(pub.settings);
  throw Error("Anonymous write succeeded");
} catch (e) {
  if ((e as { code?: string }).code !== "UNAUTHORIZED") throw e;
  console.log("PASS: anonymous writes rejected");
}
const login = await auth.api.signInEmail({
  body: { email: process.env.ADMIN_EMAIL!, password: process.env.ADMIN_PASSWORD! },
});
const client: AppRouterClient = createORPCClient(
  new RPCLink({
    url: "http://localhost:4200/api/rpc",
    headers: { Authorization: `Bearer ${login.token}` },
  }),
);
const admin = await client.management.catalog();
console.log("PASS: authenticated read", admin.products.length);
const p = admin.products.find((p) => p.id === "K01")!;
try {
  await client.management.deleteProduct({ id: p.id });
  throw Error("Linked delete succeeded");
} catch (e) {
  if ((e as { code?: string }).code !== "CONFLICT") throw e;
  console.log("PASS: linked product deletion rejected");
}
const { default: sharp } = await import("sharp");
const input = await sharp({ create: { width: 64, height: 64, channels: 3, background: "#b79a54" } })
  .png()
  .toBuffer();
const image = await client.management.upload({
  data: "data:image/png;base64," + input.toString("base64"),
});
if (!image.image.startsWith("data:image/webp;base64,")) throw Error("Upload failed");
await client.management.saveProduct({ ...p, image: image.image });
const after = await anon.shop.catalog();
if (after.products.find((x) => x.id === p.id)?.image !== image.image)
  throw Error("Image not persistent");
await client.management.saveProduct(p);
console.log("PASS: upload converted to WebP, persisted, public read verified; original restored");
const temp = { ...p, id: "TEST_DELETE", name: "Test temporary", contents: [] };
await client.management.saveProduct(temp);
await client.management.deleteProduct({ id: temp.id });
console.log("PASS: create/delete roundtrip");
const signup = await auth.handler(
  new Request("http://localhost:4200/api/auth/sign-up/email", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "http://localhost:4200" },
    body: JSON.stringify({
      email: "unauthorized@example.com",
      password: "not-a-real-secret-123",
      name: "Test",
    }),
  }),
);
if (signup.ok) throw Error("Public signup should be disabled");
console.log("PASS: public signup disabled", signup.status);

await auth.api.signOut({ headers: new Headers({ Authorization: `Bearer ${login.token}` }) });
