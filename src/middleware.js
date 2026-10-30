import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/app/:path*", "/login", "/signup"],
  unstable_allowDynamic: [
    "**/node_modules/jose/**",
    "**/node_modules/@auth/core/**",
    "**/node_modules/next-auth/**",
  ],
};
