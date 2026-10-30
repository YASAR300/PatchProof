import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/auth";
import { prisma } from "@/lib/db";
import {
  parseGitHubUrl,
  getGitHubRepo,
  getLatestCommitSha,
  detectManifests,
  suggestLanguage,
} from "@/lib/github";
import { getUserProjects, generateProjectSlug, PROJECT_COOKIE_NAME } from "@/lib/projects";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await getUserProjects(user.id);
    return NextResponse.json({ ok: true, projects });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to load repositories." },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { url, name, language, defaultBranch } = body || {};

    if (!url) {
      return NextResponse.json(
        { error: "GitHub repository URL is required." },
        { status: 400 }
      );
    }

    // 1. Strict URL parsing & validation
    let parsed;
    try {
      parsed = parseGitHubUrl(url);
    } catch (parseErr) {
      return NextResponse.json({ error: parseErr.message }, { status: 400 });
    }

    const { owner, repo, cleanUrl } = parsed;

    // 2. Validate repository on GitHub REST API
    const repoData = await getGitHubRepo(owner, repo);
    const chosenBranch = (defaultBranch || repoData.defaultBranch || "main").trim();

    // 3. Get latest commit SHA on chosen branch
    const commitData = await getLatestCommitSha(owner, repo, chosenBranch);

    // 4. Detect manifests using Git Trees API
    const detectedManifests = await detectManifests(owner, repo, commitData.sha);

    // 5. Language selection: validate and default to Python or JavaScript/TypeScript
    const finalLanguage =
      language === "Python" || language === "JavaScript/TypeScript"
        ? language
        : suggestLanguage(repoData.primaryLanguage, detectedManifests);

    const projectName = (name || repoData.name || repo).trim();
    const slug = await generateProjectSlug(projectName);

    // 6. Database transaction: Project + OWNER ProjectMember + PROJECT_CREATED AuditEvent
    const newProject = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name: projectName,
          slug,
          repoUrl: cleanUrl,
          repoOwner: owner,
          repoName: repo,
          defaultBranch: chosenBranch,
          language: finalLanguage,
          executionEnabled: false, // always false for repositories added from GitHub
          latestCommitSha: commitData.sha,
          detectedManifests,
          ownerId: user.id,
        },
      });

      // Creator is OWNER ProjectMember
      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId: user.id,
          role: "OWNER",
        },
      });

      // Write audit event PROJECT_CREATED
      await tx.auditEvent.create({
        data: {
          actorId: user.id,
          projectId: project.id,
          action: "PROJECT_CREATED",
          entityType: "Project",
          entityId: project.id,
          metadata: {
            name: project.name,
            repoUrl: cleanUrl,
            repoOwner: owner,
            repoName: repo,
            defaultBranch: chosenBranch,
            language: finalLanguage,
            latestCommitSha: commitData.sha,
            detectedManifests,
          },
        },
      });

      return project;
    });

    // 7. Store selected project id in cookie
    const cookieStore = await cookies();
    cookieStore.set(PROJECT_COOKIE_NAME, newProject.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    });

    return NextResponse.json({
      ok: true,
      project: newProject,
    });
  } catch (err) {
    console.error("Project creation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create project repository." },
      { status: 400 }
    );
  }
}

