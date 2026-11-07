import dns from "node:dns";
import { PrismaClient } from "@prisma/client";

// Ensure Node.js resolves IPv4 before IPv6 to avoid connection timeouts on networks without IPv6 routes
if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

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
