import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSessionUser } from "@/auth";
import { prisma } from "@/lib/db";

/**
 * POST /api/user/password
 * Changes the authenticated user's password (credential users only).
 */
export async function POST(req) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "This account was created via GitHub OAuth. Password authentication is not configured." },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Both current password and new password are required." },
        { status: 400 }
      );
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // Verify current password
    const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      return NextResponse.json(
        { error: "Incorrect current password." },
        { status: 400 }
      );
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    // Write audit event USER_PASSWORD_CHANGED
    await prisma.auditEvent.create({
      data: {
        actorId: user.id,
        action: "USER_PASSWORD_CHANGED",
        entityType: "User",
        entityId: user.id,
        metadata: {
          email: user.email,
        },
      },
    });

    return NextResponse.json({ ok: true, message: "Password updated successfully." });
  } catch (err) {
    console.error("[api/user/password POST] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update password." },
      { status: 500 }
    );
  }
}
