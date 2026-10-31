import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/auth";
import { prisma } from "@/lib/db";
import { getUserProjects, PROJECT_COOKIE_NAME } from "@/lib/projects";

/**
 * GET /api/findings
 * Returns findings for the active project or all user projects, with filtering and search.
 */
export async function GET(req) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const requestedProjectId = searchParams.get("projectId");
    const severity = searchParams.get("severity");
    const source = searchParams.get("source");
    const verificationState = searchParams.get("verificationState");
    const triageStatus = searchParams.get("triageStatus");
    const search = searchParams.get("search");

    // Determine target project(s)
    let projectIds = [];
    if (requestedProjectId) {
      projectIds = [requestedProjectId];
    } else {
      const cookieStore = await cookies();
      const activeCookie = cookieStore.get(PROJECT_COOKIE_NAME)?.value;
      if (activeCookie) {
        projectIds = [activeCookie];
      } else {
        const userProjects = await getUserProjects(user.id);
        projectIds = userProjects.map((p) => p.id);
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
    return NextResponse.json(
      { error: err.message || "Failed to retrieve findings." },
      { status: 500 }
    );
  }
}

