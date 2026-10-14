import { databaseRetry } from "./database-retry";
import nodemailer from "nodemailer";
import { and, eq, or, lt, lte, sql } from "drizzle-orm";
import { db } from "../database";
import * as s from "../database/schema";
import { getIntegration, formatOrderMessage, sendTelegram } from "./orders";

export const smtpConfigured = () => !!process.env.SMTP_HOST && !!process.env.SMTP_FROM && !!process.env.SMTP_USER && !!process.env.SMTP_PASSWORD;
export async function sendEmail(to: string, subject: string, text: string) {
  if (!smtpConfigured()) throw new Error("SMTP не настроен");
  const host = process.env.SMTP_HOST!;
  const secure = process.env.SMTP_SECURE !== "false";
  const local = process.env.NODE_ENV !== "production" && process.env.SMTP_ALLOW_INSECURE_LOCAL === "true" && ["localhost", "127.0.0.1", "::1"].includes(host);
  const transport = nodemailer.createTransport({
    host, port: Number(process.env.SMTP_PORT || (secure ? 465 : 587)), secure, requireTLS: !secure && !local,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASSWORD! }, tls: { rejectUnauthorized: true },
    connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 8000,
  });
  try { await transport.sendMail({ from: process.env.SMTP_FROM!, to, subject, text }); }
  catch { throw new Error("SMTP: отправка не подтверждена; проверьте соединение и учётные данные"); }
  finally { transport.close(); }
}
const retryDelay = (attempt: number) => [60000, 300000, 900000, 3600000, 21600000][Math.min(attempt - 1, 4)];
export async function deliverOrder(id: string, channel: "telegram" | "email", manual = false) {
  const config = await getIntegration();
  if (channel === "telegram" ? !config.telegramEnabled || !config.chatId : !config.emailEnabled || !config.notifyEmail) return;
  const state = channel === "telegram" ? s.orders.notification : s.orders.emailNotification;
  const atColumn = channel === "telegram" ? s.orders.notificationUpdatedAt : s.orders.emailUpdatedAt;
  const attemptsColumn = channel === "telegram" ? s.orders.telegramAttempts : s.orders.emailAttempts;
  const retryColumn = channel === "telegram" ? s.orders.telegramRetryAt : s.orders.emailRetryAt;
  const now = new Date().toISOString();
  const states = or(eq(state, "pending"), eq(state, "failed"), ...(manual ? [eq(state, "disabled")] : []), and(eq(state, "sending"), lt(atColumn, new Date(Date.now() - 120000).toISOString())));
  const conditions = and(eq(s.orders.id, id), states, ...(manual ? [] : [lt(attemptsColumn, 5), or(eq(retryColumn, ""), lte(retryColumn, now))]));
  const patch = channel === "telegram" ? { notification: "sending", notificationUpdatedAt: now, telegramAttempts: sql`${attemptsColumn} + 1` }
    : { emailNotification: "sending", emailUpdatedAt: now, emailAttempts: sql`${attemptsColumn} + 1` };
  const [row] = await databaseRetry(() => db.update(s.orders).set(patch).where(conditions).returning());
  if (!row) return;
  const attempts = channel === "telegram" ? row.telegramAttempts : row.emailAttempts;
  try {
    const text = formatOrderMessage(row.id, row.createdAt, JSON.parse(row.data));
    if (channel === "telegram") await sendTelegram(config.chatId, text);
    else await sendEmail(config.notifyEmail, `ASIA BASA: новая заявка ${row.id}`, text);
    await databaseRetry(() => db.update(s.orders).set(channel === "telegram" ? { notification: "sent", notificationError: "", telegramRetryAt: "", notificationUpdatedAt: now }
      : { emailNotification: "sent", emailError: "", emailRetryAt: "", emailUpdatedAt: now }).where(and(eq(s.orders.id, id), eq(attemptsColumn, attempts), eq(atColumn, now))));
  } catch (e) {
    const error = e instanceof Error ? e.message : "Ошибка доставки";
    const next = new Date(Date.now() + retryDelay(attempts)).toISOString();
    await databaseRetry(() => db.update(s.orders).set(channel === "telegram" ? { notification: "failed", notificationError: error, telegramRetryAt: next, notificationUpdatedAt: now }
      : { emailNotification: "failed", emailError: error, emailRetryAt: next, emailUpdatedAt: now }).where(and(eq(s.orders.id, id), eq(attemptsColumn, attempts), eq(atColumn, now))));
  }
}
let ticking = false, lastCleanup = 0;
export async function tickNotificationQueue() {
  if (ticking) return; ticking = true;
  try {
    const now = new Date().toISOString(), stale = new Date(Date.now() - 120000).toISOString();
    const config = await getIntegration();
    if (!config.telegramEnabled || !config.chatId) await db.update(s.orders).set({ notification: "disabled" }).where(or(eq(s.orders.notification, "pending"), eq(s.orders.notification, "failed"), and(eq(s.orders.notification, "sending"), lt(s.orders.notificationUpdatedAt, stale))));
    if (!config.emailEnabled || !config.notifyEmail) await db.update(s.orders).set({ emailNotification: "disabled" }).where(or(eq(s.orders.emailNotification, "pending"), eq(s.orders.emailNotification, "failed"), and(eq(s.orders.emailNotification, "sending"), lt(s.orders.emailUpdatedAt, stale))));
    const rows = await db.select({ id: s.orders.id }).from(s.orders).where(or(
      and(lt(s.orders.telegramAttempts, 5), or(eq(s.orders.notification, "pending"), and(eq(s.orders.notification, "failed"), lte(s.orders.telegramRetryAt, now)), and(eq(s.orders.notification, "sending"), lt(s.orders.notificationUpdatedAt, stale)))),
      and(lt(s.orders.emailAttempts, 5), or(eq(s.orders.emailNotification, "pending"), and(eq(s.orders.emailNotification, "failed"), lte(s.orders.emailRetryAt, now)), and(eq(s.orders.emailNotification, "sending"), lt(s.orders.emailUpdatedAt, stale)))),
    )).limit(10);
    for (const row of rows) await Promise.all([deliverOrder(row.id, "telegram"), deliverOrder(row.id, "email")]);
    if (Date.now() - lastCleanup > 3600000) {
    await db.delete(s.orderRateLimits).where(lt(s.orderRateLimits.windowStart, Date.now() - 86400000));
    await db.run(sql`DELETE FROM shop_order_guards WHERE blocked_until < ${Date.now() - 86400000} AND NOT EXISTS
      (SELECT 1 FROM shop_orders WHERE shop_orders.id = shop_order_guards.order_id AND shop_orders.status NOT IN ('completed','cancelled'))`);
    lastCleanup = Date.now();
    }
  } finally { ticking = false; }
}
let started = false;
export function startNotificationWorker() {
  if (started || process.env.NOTIFICATION_WORKER_ENABLED === "false") return; started = true;
  const timer = setInterval(() => { void tickNotificationQueue().catch(() => console.error("Order notification worker failed; inspect database/service health")); }, 15000);
  timer.unref();
}
