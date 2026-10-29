/**
 * Edge-compatible Auth.js configuration for middleware and route protection.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAppRoute = nextUrl.pathname.startsWith("/app");
      const isAuthRoute = nextUrl.pathname === "/login" || nextUrl.pathname === "/signup";

      // Protect /app and subroutes: redirect to /login?next=<path>
      if (isAppRoute) {
        if (isLoggedIn) return true;

        const loginUrl = new URL("/login", nextUrl.origin);
        loginUrl.searchParams.set("next", nextUrl.pathname + nextUrl.search);
        return Response.redirect(loginUrl);
      }

      // Signed-in users visiting /login or /signup go to /app
      if (isLoggedIn && isAuthRoute) {
        return Response.redirect(new URL("/app", nextUrl.origin));
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.avatarUrl = user.avatarUrl;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.avatarUrl = token.avatarUrl;
      }
      return session;
    },
  },
  providers: [],
};
