import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getSessionUser } from "@/auth";
import { prisma } from "@/lib/db";
import { getUserProjects, requireProjectRole, PROJECT_COOKIE_NAME } from "@/lib/projects";

const querySchema = z.object({
  projectId: z.string().trim().optional(),
  severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO", "ALL"]).optional(),
  source: z.enum(["SCANNER", "IMPORT", "ALL"]).optional(),
  verificationState: z.enum(["UNVERIFIED", "REPRODUCED", "NOT_REPRODUCED", "INCONCLUSIVE", "EXECUTION_ERROR", "ALL"]).optional(),
  triageStatus: z.enum(["OPEN", "FIXED", "IGNORED", "ALL"]).optional(),
  search: z.string().max(200).optional(),
});

/**
 * GET /api/findings
 * Returns findings for the active project or all user projects, with filtering and search.
 * Strictly verifies project membership and authorization.
 */
export async function GET(req) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const parsedQuery = querySchema.safeParse({
      projectId: searchParams.get("projectId") || undefined,
      severity: searchParams.get("severity") || undefined,
      source: searchParams.get("source") || undefined,
      verificationState: searchParams.get("verificationState") || undefined,
      triageStatus: searchParams.get("triageStatus") || undefined,
      search: searchParams.get("search") || undefined,
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        { error: parsedQuery.error.errors[0]?.message || "Invalid query parameters." },
        { status: 400 }
      );
    }

    const {
      projectId: requestedProjectId,
      severity,
      source,
      verificationState,
      triageStatus,
      search,
    } = parsedQuery.data;

    const userProjects = await getUserProjects(user.id);
    const userProjectIds = userProjects.map((p) => p.id);

    // Determine target project(s)
    let projectIds = [];
    if (requestedProjectId) {
      // Must verify project membership for the explicitly requested project
      try {
        await requireProjectRole(requestedProjectId, user.id, ["OWNER", "MEMBER", "VIEWER"]);
        projectIds = [requestedProjectId];
      } catch {
        return NextResponse.json(
          { error: "Forbidden: You do not have permission to view findings for this project." },
          { status: 403 }
        );
      }
    } else {
      const cookieStore = await cookies();
      const activeCookie = cookieStore.get(PROJECT_COOKIE_NAME)?.value;
      if (activeCookie && userProjectIds.includes(activeCookie)) {
        projectIds = [activeCookie];
      } else {
        projectIds = userProjectIds;
      }
    }

    if (projectIds.length === 0) {
      return NextResponse.json({ ok: true, findings: [] });
    }

    const where = {
      projectId: { in: projectIds },
    };

    if (severity && severity !== "ALL") {
      where.severity = severity;
    }

    if (source && source !== "ALL") {
      where.source = source;
    }

    if (verificationState && verificationState !== "ALL") {
      where.verificationState = verificationState;
    }

    if (triageStatus && triageStatus !== "ALL") {
      where.triageStatus = triageStatus;
    }

    if (search && search.trim()) {
      const query = search.trim();
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { ruleId: { contains: query, mode: "insensitive" } },
        { filePath: { contains: query, mode: "insensitive" } },
        { cwe: { contains: query, mode: "insensitive" } },
      ];
    }

    const findings = await prisma.finding.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
            isDemo: true,
          },
        },
        scan: {
          select: {
            id: true,
            commitSha: true,
            branch: true,
            tool: true,
            startedAt: true,
          },
        },
      },
      orderBy: [
        { severity: "asc" }, // CRITICAL -> HIGH -> MEDIUM -> LOW -> INFO in enum order
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ ok: true, findings });
  } catch (err) {
    console.error("[api/findings] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load findings." },
      { status: 500 }
    );
  }
}
