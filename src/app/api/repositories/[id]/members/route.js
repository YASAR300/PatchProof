import { NextResponse } from "next/server";
import { getSessionUser } from "@/auth";
import { prisma } from "@/lib/db";
import { requireProjectRole, getProjectRole } from "@/lib/projects";

const VALID_ROLES = ["OWNER", "MEMBER", "VIEWER"];

/**
 * GET /api/repositories/[id]/members
 * Lists all members of a project with user profile details and roles.
 */
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requireProjectRole(id, user.id, ["OWNER", "MEMBER", "VIEWER"]);

    const members = await prisma.projectMember.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true },
        },
      },
    });

    const currentUserRole = await getProjectRole(id, user.id);

    return NextResponse.json({ ok: true, members, currentUserRole });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch project members" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/repositories/[id]/members
 * Adds an existing user by email to the project.
 * Restricted to OWNER role.
 */
export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only OWNER can add members
    try {
      await requireProjectRole(id, user.id, ["OWNER"]);
    } catch {
      return NextResponse.json(
        { error: "Forbidden: Only project owners can add members." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { email, role = "MEMBER" } = body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Valid user email is required." }, { status: 400 });
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role '${role}'. Allowed: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find existing user by email
    const targetUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, name: true, email: true, avatarUrl: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: `No registered user found with email '${cleanEmail}'. Please ask them to sign up first.` },
        { status: 404 }
      );
    }

    // Check if already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: id,
          userId: targetUser.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: `User '${cleanEmail}' is already a member of this project.` },
        { status: 400 }
      );
    }

    const newMember = await prisma.projectMember.create({
      data: {
        projectId: id,
        userId: targetUser.id,
        role,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    // Write audit event MEMBER_ADDED
    await prisma.auditEvent.create({
      data: {
        actorId: user.id,
        projectId: id,
        action: "MEMBER_ADDED",
        entityType: "ProjectMember",
        entityId: newMember.id,
        metadata: {
          memberUserId: targetUser.id,
          memberEmail: targetUser.email,
          memberName: targetUser.name,
          role,
          addedBy: user.email,
        },
      },
    });

    return NextResponse.json({ ok: true, member: newMember }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to add project member" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/repositories/[id]/members
 * Updates a member's role (OWNER, MEMBER, VIEWER).
 * Restricted to OWNER. Enforces that at least one OWNER must remain.
 */
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only OWNER can modify roles
    try {
      await requireProjectRole(id, user.id, ["OWNER"]);
    } catch {
      return NextResponse.json(
        { error: "Forbidden: Only project owners can modify member roles." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { memberId, role } = body;

    if (!memberId || !role || !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: "memberId and valid role (OWNER, MEMBER, VIEWER) are required." },
        { status: 400 }
      );
    }

    const member = await prisma.projectMember.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!member || member.projectId !== id) {
      return NextResponse.json({ error: "Member not found in this project." }, { status: 404 });
    }

    // Rule: At least one OWNER must remain
    if (member.role === "OWNER" && role !== "OWNER") {
      const ownerCount = await prisma.projectMember.count({
        where: { projectId: id, role: "OWNER" },
      });
      if (ownerCount <= 1) {
        return NextResponse.json(
          { error: "Cannot demote the last project owner. At least one OWNER must remain." },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.projectMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    // Write audit event MEMBER_ROLE_UPDATED
    await prisma.auditEvent.create({
      data: {
        actorId: user.id,
        projectId: id,
        action: "MEMBER_ROLE_UPDATED",
        entityType: "ProjectMember",
        entityId: memberId,
        metadata: {
          memberEmail: member.user.email,
          previousRole: member.role,
          newRole: role,
          updatedBy: user.email,
        },
      },
    });

    return NextResponse.json({ ok: true, member: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to update member role" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/repositories/[id]/members
 * Removes a member from the project.
 * Restricted to OWNER. Enforces that at least one OWNER must remain.
 */
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only OWNER can remove members
    try {
      await requireProjectRole(id, user.id, ["OWNER"]);
    } catch {
      return NextResponse.json(
        { error: "Forbidden: Only project owners can remove members." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");

    if (!memberId) {
      return NextResponse.json({ error: "memberId query parameter is required." }, { status: 400 });
    }

    const member = await prisma.projectMember.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!member || member.projectId !== id) {
      return NextResponse.json({ error: "Member not found in this project." }, { status: 404 });
    }

    // Rule: At least one OWNER must remain
    if (member.role === "OWNER") {
      const ownerCount = await prisma.projectMember.count({
        where: { projectId: id, role: "OWNER" },
      });
      if (ownerCount <= 1) {
        return NextResponse.json(
          { error: "Cannot remove the last project owner. At least one OWNER must remain." },
          { status: 400 }
        );
      }
    }

    await prisma.projectMember.delete({
      where: { id: memberId },
    });

    // Write audit event MEMBER_REMOVED
    await prisma.auditEvent.create({
      data: {
        actorId: user.id,
        projectId: id,
        action: "MEMBER_REMOVED",
        entityType: "ProjectMember",
        entityId: memberId,
        metadata: {
          memberEmail: member.user.email,
          memberName: member.user.name,
          removedRole: member.role,
          removedBy: user.email,
        },
      },
    });

    return NextResponse.json({ ok: true, removedMemberId: memberId });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to remove member" },
      { status: 500 }
    );
  }
}

