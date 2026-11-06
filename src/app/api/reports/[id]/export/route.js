import { NextResponse } from "next/server";
import { getSessionUser } from "@/auth";
import { prisma } from "@/lib/db";
import { requireProjectRole } from "@/lib/projects";
import { buildEvidenceDocument, generateMarkdownReport } from "@/lib/report";

/**
 * GET /api/reports/[id]/export?format=json|md
 * Exports a patch validation report in structured JSON or clean Markdown format.
 * Enforces authentication and project membership (returns 401 or 403).
 */
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const report = await prisma.patchReport.findUnique({
      where: { id },
      include: {
        project: true,
        finding: true,
        baselineRun: {
          include: { artifacts: true },
        },
        candidateRun: {
          include: { artifacts: true },
        },
        artifacts: true,
        decisions: true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Check project membership (OWNER, MEMBER, VIEWER)
    try {
      await requireProjectRole(report.projectId, user.id, ["OWNER", "MEMBER", "VIEWER"]);
    } catch (err) {
      return NextResponse.json(
        { error: "Forbidden: You are not a member of this project." },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const format = (url.searchParams.get("format") || "json").toLowerCase();

    const doc = buildEvidenceDocument(report);

    if (format === "md" || format === "markdown") {
      const markdown = generateMarkdownReport(doc);
      return new Response(markdown, {
        status: 200,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="patchproof-report-${id}.md"`,
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }

    // Default to JSON export
    const jsonString = JSON.stringify(doc, null, 2);
    return new Response(jsonString, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="patchproof-report-${id}.json"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    console.error("[api/reports/[id]/export] Error exporting report:", err);
    return NextResponse.json(
      { error: "Internal server error during report export" },
      { status: 500 }
    );
  }
}
