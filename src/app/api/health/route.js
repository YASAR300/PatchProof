import { NextResponse } from "next/server";
import { APP_CONFIG } from "@/lib/constants";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "patchproof",
    version: APP_CONFIG.version,
    time: new Date().toISOString(),
  });
}
