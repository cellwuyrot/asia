import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { db } from "./database";
export const auth = betterAuth({
  basePath: "/api/auth",
  baseURL: process.env.WEBSITE_URL?.replace(/\/$/, ""),
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "sqlite" }),
  emailAndPassword: { enabled: true, disableSignUp: true, minPasswordLength: 12 },
  trustedOrigins: [
    (process.env.WEBSITE_URL || "http://localhost:4200").replace(/\/$/, ""),
    "http://localhost:4200",
    ...(process.env.AUTH_TRUSTED_ORIGINS || "")
      .split(",")
      .map((origin) => origin.trim().replace(/\/$/, "")),
  ].filter(Boolean),
  plugins: [bearer()],
  rateLimit: { enabled: true, window: 60, max: 30 },
  advanced: { defaultCookieAttributes: { sameSite: "none", secure: true } },
});
