import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/db";

const hasGithubConfig =
  Boolean(process.env.GITHUB_CLIENT_ID) && Boolean(process.env.GITHUB_CLIENT_SECRET);

const providers = [
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const email = String(credentials.email).toLowerCase().trim();
      const password = String(credentials.password);

      let user = null;
      try {
        user = await prisma.user.findUnique({
          where: { email },
        });
      } catch (err) {
        console.error("Database error during authorize:", err);
        return null;
      }

      if (!user || !user.passwordHash) {
        return null;
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return null;
      }

      // Record audit event for successful sign-in
      try {
        await prisma.auditEvent.create({
          data: {
            actorId: user.id,
            action: "USER_SIGNED_IN",
            entityType: "User",
            entityId: user.id,
            metadata: { method: "credentials", email: user.email },
          },
        });
      } catch (auditErr) {
        console.error("Failed to record sign-in audit event:", auditErr);
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
      };
    },
  }),
];

if (hasGithubConfig) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (account?.provider === "github") {
        const githubId = String(account.providerAccountId || user.id);
        const email = user.email ? String(user.email).toLowerCase().trim() : null;

        if (!email && !githubId) return false;

        try {
          // Upsert user by githubId or email
          let existing = null;
          if (githubId) {
            existing = await prisma.user.findUnique({ where: { githubId } });
          }
          if (!existing && email) {
            existing = await prisma.user.findUnique({ where: { email } });
          }

          let dbUser = null;
          let isNewUser = false;

          if (existing) {
            dbUser = await prisma.user.update({
              where: { id: existing.id },
              data: {
                githubId,
                avatarUrl: user.image || existing.avatarUrl,
                name: user.name || existing.name,
              },
            });
          } else {
            isNewUser = true;
            dbUser = await prisma.user.create({
              data: {
                email: email || `${githubId}@github.patchproof.dev`,
                name: user.name || profile?.login || "GitHub User",
                githubId,
                avatarUrl: user.image,
                role: "USER",
              },
            });
          }

          user.id = dbUser.id;
          user.role = dbUser.role;
          user.avatarUrl = dbUser.avatarUrl;

          // Record audit event
          await prisma.auditEvent.create({
            data: {
              actorId: dbUser.id,
              action: isNewUser ? "USER_SIGNED_UP" : "USER_SIGNED_IN",
              entityType: "User",
              entityId: dbUser.id,
              metadata: { method: "github", githubId },
            },
          });
        } catch (err) {
          console.error("Error during GitHub sign in upsert:", err);
          return false;
        }
      }
      return true;
    },
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "patchproof_auth_super_secret_jwt_key_2026_dev_secure",
});

/**
 * Returns current authenticated user or null.
 */
export async function getSessionUser() {
  const session = await auth();
  return session?.user || null;
}

/**
 * Ensures user is authenticated, redirecting to /login if not.
 */
export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
