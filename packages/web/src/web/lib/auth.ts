import { createAuthClient } from "better-auth/react";
const KEY = "asiabasa-admin-token";
export const getToken = () => sessionStorage.getItem(KEY) || "";
export const clearToken = () => sessionStorage.removeItem(KEY);
export const authClient = createAuthClient({
  baseURL: window.location.origin,
  basePath: "/api/auth",
  fetchOptions: {
    auth: { type: "Bearer", token: getToken },
    onSuccess: (ctx) => {
      const token = ctx.response.headers.get("set-auth-token");
      if (token) sessionStorage.setItem(KEY, token);
    },
  },
});
