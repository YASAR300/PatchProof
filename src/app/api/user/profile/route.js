import { NextResponse } from "next/server";
import { getSessionUser } from "@/auth";
import { prisma } from "@/lib/db";

/**
 * PATCH /api/user/profile
 * Updates the authenticated user's display name.
 */
export async function PATCH(req) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { name } = body;

    if (typeof name !== "string") {
      return NextResponse.json({ error: "Name must be a string." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { name: name.trim() || null },
      select: { id: true, name: true, email: true, avatarUrl: true },
    });

    // Write audit event USER_PROFILE_UPDATED
    await prisma.auditEvent.create({
      data: {
        actorId: user.id,
        action: "USER_PROFILE_UPDATED",
        entityType: "User",
        entityId: user.id,
        metadata: {
          updatedName: updated.name,
          email: user.email,
        },
      },
    });

    return NextResponse.json({ ok: true, user: updated });
  } catch (err) {
    console.error("[api/user/profile PATCH] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update profile." },
      { status: 500 }
    );
  }
}
