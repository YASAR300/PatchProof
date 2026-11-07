import { NextResponse } from "next/server";
import { getSessionUser } from "@/auth";
import { prisma } from "@/lib/db";
import { requireProjectRole } from "@/lib/projects";
import { generate } from "@/lib/ai";

const VALID_TASKS = [
  "explain-finding",
  "summarize-run",
  "explain-report",
  "suggest-tests",
  "suggest-remediation",
];

/**
 * GET /api/ai/explain?entityType=&entityId=
 * Returns the latest existing explanation for an entity, if available.
 */
export async function GET(req) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");

    if (!entityType || !entityId) {
      return NextResponse.json({ error: "entityType and entityId are required" }, { status: 400 });
    }

    const explanation = await prisma.aiExplanation.findFirst({
      where: { entityType, entityId },
      orderBy: { createdAt: "desc" },
    });

    if (!explanation) {
      return NextResponse.json({ ok: false, explanation: null }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      explanation: explanation.content,
      provider: explanation.provider,
      model: explanation.model,
      createdAt: explanation.createdAt,
    });
  } catch (err) {
    console.error("[api/ai/explain GET] Error:", err);
    return NextResponse.json({ error: "Failed to fetch explanation" }, { status: 500 });
  }
}

/**
 * POST /api/ai/explain
 * Generates or retrieves a cached AI explanation.
 */
export async function POST(req) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { task = "explain-finding", entityType, entityId } = body;

    if (!VALID_TASKS.includes(task)) {
      return NextResponse.json(
        { error: `Invalid task '${task}'. Allowed: ${VALID_TASKS.join(", ")}` },
        { status: 400 }
      );
    }

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: "Both 'entityType' and 'entityId' are required." },
        { status: 400 }
      );
    }

    let evidence = {};
    let projectId = null;

    // Resolve target entity evidence and check project membership
    if (entityType.toLowerCase() === "finding") {
      const finding = await prisma.finding.findUnique({
        where: { id: entityId },
        include: {
          project: true,
          verificationRuns: {
            take: 3,
            orderBy: { createdAt: "desc" },
            include: { artifacts: true },
          },
          patchReports: {
            take: 2,
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!finding) {
        return NextResponse.json({ error: "Finding not found" }, { status: 404 });
      }

      projectId = finding.projectId;
      evidence = {
        finding: {
          id: finding.id,
          ruleId: finding.ruleId,
          title: finding.title,
          tool: finding.tool,
          severity: finding.severity,
          filePath: finding.filePath,
          lineStart: finding.lineStart,
          lineEnd: finding.lineEnd,
          snippet: finding.snippet,
          cwe: finding.cwe,
          triageStatus: finding.triageStatus,
          verificationState: finding.verificationState,
        },
        run: finding.verificationRuns?.[0] || null,
        report: finding.patchReports?.[0] || null,
        artifacts: finding.verificationRuns?.[0]?.artifacts || [],
      };
    } else if (entityType.toLowerCase() === "verificationrun" || entityType.toLowerCase() === "run") {
      const run = await prisma.verificationRun.findUnique({
        where: { id: entityId },
        include: {
          finding: true,
          project: true,
          artifacts: true,
        },
      });

      if (!run) {
        return NextResponse.json({ error: "Verification run not found" }, { status: 404 });
      }

      projectId = run.projectId;
      evidence = {
        run: {
          id: run.id,
          commitSha: run.commitSha,
          reproducerId: run.reproducerId,
          testVersion: run.testVersion,
          status: run.status,
          exitCode: run.exitCode,
          durationMs: run.durationMs,
          assertions: run.assertions,
          environment: run.environment,
        },
        finding: run.finding
          ? {
              id: run.finding.id,
              ruleId: run.finding.ruleId,
              title: run.finding.title,
              filePath: run.finding.filePath,
              snippet: run.finding.snippet,
            }
          : null,
        artifacts: run.artifacts || [],
      };
    } else if (entityType.toLowerCase() === "patchreport" || entityType.toLowerCase() === "report") {
      const report = await prisma.patchReport.findUnique({
        where: { id: entityId },
        include: {
          finding: true,
          project: true,
          baselineRun: {
            include: { artifacts: true },
          },
          candidateRun: {
            include: { artifacts: true },
          },
          artifacts: true,
        },
      });

      if (!report) {
        return NextResponse.json({ error: "Patch report not found" }, { status: 404 });
      }

      projectId = report.projectId;
      evidence = {
        report: {
          id: report.id,
          baselineCommit: report.baselineCommit,
          candidateCommit: report.candidateCommit,
          verdict: report.verdict,
          summary: report.summary,
          diffStat: report.diffStat,
          regressionResults: report.regressionResults,
        },
        finding: report.finding
          ? {
              id: report.finding.id,
              ruleId: report.finding.ruleId,
              title: report.finding.title,
              filePath: report.finding.filePath,
              snippet: report.finding.snippet,
            }
          : null,
        baselineRun: report.baselineRun || null,
        candidateRun: report.candidateRun || null,
        artifacts: [
          ...(report.artifacts || []),
          ...(report.baselineRun?.artifacts || []),
          ...(report.candidateRun?.artifacts || []),
        ],
      };
    } else {
      return NextResponse.json(
        { error: `Unsupported entityType '${entityType}'. Allowed: Finding, VerificationRun, PatchReport` },
        { status: 400 }
      );
    }

    // Verify project authorization
    if (projectId) {
      try {
        await requireProjectRole(projectId, user.id, ["OWNER", "MEMBER", "VIEWER"]);
      } catch {
        return NextResponse.json(
          { error: "Forbidden: You are not a member of this project." },
          { status: 403 }
        );
      }
    }

    // Call AI provider interface
    const result = await generate({
      task,
      evidence,
      entityType,
      entityId,
      userId: user.id,
    });

    return NextResponse.json({
      ok: true,
      cached: result.cached,
      provider: result.provider,
      model: result.model,
      data: result.explanation,
    });
  } catch (err) {
    console.error("[api/ai/explain POST] Error:", err);

    if (err.statusCode === 429) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }

    if (err.isAuthError) {
      return NextResponse.json(
        { error: err.message, provider: "anthropic", model: process.env.AI_MODEL || "claude-3-5-sonnet" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: err.message || "Failed to generate AI explanation" },
      { status: err.statusCode || 500 }
    );
  }
}

