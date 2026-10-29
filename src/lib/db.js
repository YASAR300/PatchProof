import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

/**
 * Prisma Client Singleton
 * Prevents multiple instances of PrismaClient in Next.js development hot-reloading.
 */
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
