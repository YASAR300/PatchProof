import React from "react";
import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { requireUser } from "@/auth";
import { getProjectForUser } from "@/lib/projects";
import { getRecentCommits } from "@/lib/github";
import { RepositoryDetailClient } from "./RepositoryDetailClient";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const user = await requireUser();
  const project = await getProjectForUser(id, user.id);
  if (!project) return { title: "Repository Not Found" };

  return {
    title: `${project.name} — Repositories`,
    description: `Security verification posture for ${project.repoOwner}/${project.repoName}`,
  };
}

export default async function RepositoryDetailPage({ params }) {
  const { id } = await params;
  const user = await requireUser();
  const project = await getProjectForUser(id, user.id);

  if (!project) {
    notFound();
  }

  let commits = [];

  // If this is a demo repository, load tags and SHAs directly from demo-manifest.json
  if (project.isDemo || project.repoUrl === "local:demo-target") {
    const manifestPath = path.resolve(process.cwd(), "demo-manifest.json");
    if (fs.existsSync(manifestPath)) {
      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
        commits = (manifest.tags || [])
          .map((t, index) => {
            const timestamp = new Date(
              Date.parse("2026-01-01T12:00:00Z") + index * 10 * 60 * 1000
            ).toISOString();
            return {
              sha: t.sha,
              shortSha: t.sha.slice(0, 7),
              message: `[tag: ${t.name}] ${t.description}`,
              author: "PatchProof Engine",
              date: timestamp,
              htmlUrl: `#tag-${t.name}`,
            };
          })
          .reverse(); // Reverse so newest commit is on top
      } catch (err) {
        console.error("Failed to load demo manifest commits:", err);
      }
    }
  } else {
    // Fetch latest 15 commits from GitHub REST API (cached 60s)
    commits = await getRecentCommits(
      project.repoOwner,
      project.repoName,
      project.defaultBranch,
      15
    );
  }

  return (
    <RepositoryDetailClient
      project={project}
      initialCommits={commits}
      memberRole={project.memberRole}
    />
  );
}
