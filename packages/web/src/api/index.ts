import type { RouterClient } from "@orpc/server";
import { createApp } from "./__core/app";
import { ping } from "./routes/ping";
import { shop, management } from "./routes/shop";
import { orderPublic, orderManagement } from "./routes/orders";
import { db } from "./database";
import * as schema from "./database/schema";
import { setCookie } from "hono/cookie";
import { checkOrigin } from "./services/orders";
import { deviceId, issueDevice } from "./services/order-security";
import { startNotificationWorker } from "./services/order-notifications";
import { auth } from "./auth";

// API features are oRPC procedures, one file per feature in ./routes/,
// composed into this router — typed end-to-end via the clients
// (web: src/web/lib/api.ts, mobile: lib/api.ts).
// Keep each routes/ file under 500 lines (`bun run lint` enforces this);
// split into more feature files as they grow.
// Patterns and examples: skills/app/references/api.md
export const router = {
  ping,
  shop: { ...shop, ...orderPublic },
  management: { ...management, ...orderManagement },
};

export type AppRouter = typeof router;
/** Typed client for the router — used by the web and mobile api clients. */
export type AppRouterClient = RouterClient<AppRouter>;

const app = createApp(router);
app.post("/api/order-session", async c => {
  try { checkOrigin(c.req.raw.headers); } catch { return c.json({ message: "Invalid origin" }, 403); }
  if (!deviceId(c.req.raw.headers)) setCookie(c, "asia-order-device", issueDevice(), { httpOnly: true, sameSite: "Strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 7 * 86400 });
  return c.json({ ready: true });
});
app.get("/api/ready", async c => {
  try { await db.select({ id: schema.orders.id }).from(schema.orders).limit(1); await db.select({ id: schema.settings.id }).from(schema.settings).limit(1); return c.json({ status: "ready" }); }
  catch { return c.json({ status: "unavailable" }, 503); }
});
startNotificationWorker();
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));
// Rare plain-HTTP endpoints (webhooks, streaming, the Better Auth handler)
// register here with full paths, e.g. app.post("/api/webhooks/example", ...)

export default app;
