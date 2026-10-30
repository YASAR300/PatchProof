import { prisma } from "@/lib/db";

/**
 * Cookie name used to persist the user's currently selected project ID
 */
export const PROJECT_COOKIE_NAME = "patchproof_project_id";

/**
 * Returns all projects a user has membership in (or owns).
 */
export async function getUserProjects(userId) {
  if (!userId) return [];

  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    include: {
      project: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return memberships.map((m) => ({
    ...m.project,
    memberRole: m.role,
  }));
}

/**
 * Validates project membership and authorization.
 * Returns { project, memberRole } or null if not a member.
 */
export async function getProjectForUser(projectId, userId) {
  if (!projectId || !userId) return null;

  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
    include: {
      project: true,
    },
  });

  if (!membership || !membership.project) return null;

  return {
    ...membership.project,
    memberRole: membership.role,
  };
}

/**
 * Determines the currently active project for a user based on the cookie,
 * falling back to the user's most recent project if the cookie is missing or invalid.
 */
export async function getActiveProject(cookieStore, userId) {
  const userProjects = await getUserProjects(userId);
  if (userProjects.length === 0) {
    return { activeProject: null, userProjects: [] };
  }

  const cookieVal = cookieStore?.get ? cookieStore.get(PROJECT_COOKIE_NAME)?.value : null;

  let active = null;
  if (cookieVal) {
    active = userProjects.find((p) => p.id === cookieVal);
  }

  if (!active) {
    active = userProjects[0];
  }

  return { activeProject: active, userProjects };
}

/**
 * Enforces that user has required role on project.
 * Throws an Error if unauthorized.
 */
export async function requireProjectRole(projectId, userId, minimumRoles = ["OWNER", "MEMBER"]) {
  const project = await getProjectForUser(projectId, userId);
  if (!project) {
    throw new Error("Project not found or you do not have permission to access it.");
  }

  if (!minimumRoles.includes(project.memberRole)) {
    throw new Error(
      `Permission denied: your role (${project.memberRole}) cannot perform this action.`
    );
  }

  return project;
}

/**
 * Creates a URL-safe, unique slug from a repo name.
 */
export async function generateProjectSlug(baseName) {
  const cleanBase = baseName
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/^-+|-+$/g, "") || "project";

  let slug = cleanBase;
  let counter = 1;

  while (true) {
    const existing = await prisma.project.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing) return slug;

    slug = `${cleanBase}-${counter}`;
    counter++;
  }
}

