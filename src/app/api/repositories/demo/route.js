import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { getSessionUser } from "@/auth";
import { prisma } from "@/lib/db";
import { generateProjectSlug, PROJECT_COOKIE_NAME } from "@/lib/projects";

export async function POST() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Read demo-manifest.json
    const manifestPath = path.resolve(process.cwd(), "demo-manifest.json");
    let manifest = null;
    if (fs.existsSync(manifestPath)) {
      try {
        manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      } catch (err) {
        console.error("Failed to parse demo-manifest.json", err);
      }
    }

    const baselineTag = manifest?.tags?.find((t) => t.name === "baseline") || manifest?.tags?.[0];
    const latestSha = baselineTag?.sha || "9d13f9f";

    // Check if user already has a demo project
    const existingDemo = await prisma.project.findFirst({
      where: {
        ownerId: user.id,
        isDemo: true,
      },
    });

    let project = existingDemo;

    if (!project) {
      const slug = await generateProjectSlug("demo-target");
      project = await prisma.$transaction(async (tx) => {
        const p = await tx.project.create({
          data: {
            name: "demo-target (Vulnerable Demo)",
            slug,
            repoUrl: "local:demo-target",
            repoOwner: "local",
            repoName: "demo-target",
            defaultBranch: manifest?.defaultBranch || "main",
            language: manifest?.language || "Python",
            isDemo: true,
            executionEnabled: true,
            latestCommitSha: latestSha,
            detectedManifests: ["requirements.txt", "web/package.json"],
            ownerId: user.id,
          },
        });

        await tx.projectMember.create({
          data: {
            projectId: p.id,
            userId: user.id,
            role: "OWNER",
          },
        });

        await tx.auditEvent.create({
          data: {
            projectId: p.id,
            userId: user.id,
            action: "PROJECT_CREATED",
            details: {
              source: "demo_target",
              repoUrl: "local:demo-target",
              isDemo: true,
              executionEnabled: true,
            },
          },
        });

        return p;
      });
    }

    // Set as active project cookie
    const cookieStore = await cookies();
    cookieStore.set(PROJECT_COOKIE_NAME, project.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });

    return NextResponse.json({ ok: true, project });
  } catch (err) {
    console.error("Error creating demo repository:", err);
    return NextResponse.json(
      { error: err.message || "Failed to add demo project" },
      { status: 500 }
    );
  }
}

