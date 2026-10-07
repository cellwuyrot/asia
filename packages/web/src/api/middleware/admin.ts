import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { auth } from "../auth";
export const admin = base.use(async ({ context, next }) => {
  const session = await auth.api.getSession({ headers: context.headers });
  if (!session) throw new ORPCError("UNAUTHORIZED", { message: "Войдите в админку" });
  if (session.user.email.toLowerCase() !== process.env.ADMIN_EMAIL?.trim().toLowerCase())
    throw new ORPCError("FORBIDDEN");
  return next({ context: { user: session.user } });
});
