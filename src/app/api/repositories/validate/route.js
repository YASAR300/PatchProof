import { NextResponse } from "next/server";
import { getSessionUser } from "@/auth";
import {
  parseGitHubUrl,
  getGitHubRepo,
  getLatestCommitSha,
  detectManifests,
  suggestLanguage,
} from "@/lib/github";

export async function POST(req) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { url } = body || {};

    if (!url) {
      return NextResponse.json(
        { error: "Repository URL is required." },
        { status: 400 }
      );
    }

    // Strict URL Parsing
    let parsed;
    try {
      parsed = parseGitHubUrl(url);
    } catch (parseErr) {
      return NextResponse.json({ error: parseErr.message }, { status: 400 });
    }

    const { owner, repo, cleanUrl } = parsed;

    // Validate against GitHub REST API
    const repoData = await getGitHubRepo(owner, repo);
    const commitData = await getLatestCommitSha(owner, repo, repoData.defaultBranch);
    const manifests = await detectManifests(owner, repo, commitData.sha);
    const suggestedLang = suggestLanguage(repoData.primaryLanguage, manifests);

    return NextResponse.json({
      ok: true,
      url: cleanUrl,
      owner,
      repo,
      name: repoData.name,
      fullName: repoData.fullName,
      defaultBranch: repoData.defaultBranch,
      githubLanguage: repoData.primaryLanguage,
      suggestedLanguage: suggestedLang,
      latestCommitSha: commitData.sha,
      latestCommitShortSha: commitData.shortSha,
      latestCommitMessage: commitData.message,
      latestCommitDate: commitData.date,
      detectedManifests: manifests,
      executionEnabled: false,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to inspect GitHub repository." },
      { status: 400 }
    );
  }
}

