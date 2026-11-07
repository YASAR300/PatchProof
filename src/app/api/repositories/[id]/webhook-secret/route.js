import { NextResponse } from "next/server";
import { getSessionUser } from "@/auth";
import { prisma } from "@/lib/db";
import { requireProjectRole } from "@/lib/projects";
import { generateWebhookSecret, encryptSecret } from "@/lib/crypto";

/**
 * POST /api/repositories/[id]/webhook-secret
 * Generates or rotates a random 32-byte webhook secret, stores it encrypted with AES-256-GCM,
 * and returns the plaintext secret once for user copying.
 */
export async function POST(req, { params }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const project = await requireProjectRole(id, user.id, ["OWNER", "MEMBER"]);

    const newSecret = generateWebhookSecret();
    const encryptedSecret = encryptSecret(newSecret);

    await prisma.project.update({
      where: { id: project.id },
      data: {
        webhookSecretEncrypted: encryptedSecret,
      },
    });

    // Audit event: PROJECT_WEBHOOK_SECRET_ROTATED
    try {
      await prisma.auditEvent.create({
        data: {
          actorId: user.id,
          projectId: project.id,
          action: "PROJECT_WEBHOOK_SECRET_ROTATED",
          entityType: "Project",
          entityId: project.id,
          metadata: {
            actorEmail: user.email,
          },
        },
      });
    } catch (auditErr) {
      console.warn("Failed to create audit event for secret rotation:", auditErr.message);
    }

    return NextResponse.json({
      ok: true,
      secret: newSecret,
      message: "Webhook secret generated successfully. Save this secret now; it cannot be shown again.",
    });
  } catch (err) {
    console.error("[api/repositories/[id]/webhook-secret] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate webhook secret" },
      { status: 500 }
    );
  }
}

