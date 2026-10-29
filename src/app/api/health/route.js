import { NextResponse } from "next/server";
import { APP_CONFIG } from "@/lib/constants";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  let dbStatus = "down";

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database healthcheck timeout")), 2000)
    );
    await Promise.race([prisma.$queryRaw`SELECT 1`, timeoutPromise]);
    dbStatus = "up";
  } catch {
    dbStatus = "down";
  }

  return NextResponse.json({
    status: "ok",
    app: "patchproof",
    version: APP_CONFIG.version,
    time: new Date().toISOString(),
    db: dbStatus,
  });
}
