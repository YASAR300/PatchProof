import crypto from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/**
 * Computes git diff and file-level stats between two commits.
 *
 * @param {string} repoPath - Path to the git repository
 * @param {string} baselineSha - Resolved baseline commit SHA
 * @param {string} candidateSha - Resolved candidate commit SHA
 * @returns {Promise<{
 *   fullDiff: string,
 *   sha256: string,
 *   sizeBytes: number,
 *   diffStat: {
 *     filesChanged: number,
 *     insertions: number,
 *     deletions: number,
 *     files: Array<{ path: string, insertions: number, deletions: number }>
 *   }
 * }>}
 */
export async function computeGitDiff(repoPath, baselineSha, candidateSha) {
  // 1. Full unified diff
  let fullDiff = "";
  try {
    const { stdout } = await execFileAsync("git", [
      "-C",
      repoPath,
      "diff",
      `${baselineSha}..${candidateSha}`,
    ]);
    fullDiff = stdout || "";
  } catch (err) {
    fullDiff = `# Error generating diff between ${baselineSha} and ${candidateSha}: ${err.message}`;
  }

  // 2. Numstat for file-level statistics
  let filesChanged = 0;
  let totalInsertions = 0;
  let totalDeletions = 0;
  const files = [];

  try {
    const { stdout: numstatOut } = await execFileAsync("git", [
      "-C",
      repoPath,
      "diff",
      "--numstat",
      `${baselineSha}..${candidateSha}`,
    ]);

    const lines = (numstatOut || "").trim().split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      const parts = line.split(/\t+/);
      if (parts.length >= 3) {
        const ins = parts[0] === "-" ? 0 : parseInt(parts[0], 10) || 0;
        const del = parts[1] === "-" ? 0 : parseInt(parts[1], 10) || 0;
        const filePath = parts.slice(2).join("\t").trim();

        files.push({
          path: filePath,
          insertions: ins,
          deletions: del,
        });

        totalInsertions += ins;
        totalDeletions += del;
      }
    }
    filesChanged = files.length;
  } catch (err) {
    console.warn(`[diff] Failed to compute numstat between ${baselineSha} and ${candidateSha}:`, err.message);
  }

  const sha256 = crypto.createHash("sha256").update(fullDiff, "utf8").digest("hex");
  const sizeBytes = Buffer.byteLength(fullDiff, "utf8");

  return {
    fullDiff,
    sha256,
    sizeBytes,
    diffStat: {
      filesChanged,
      insertions: totalInsertions,
      deletions: totalDeletions,
      files,
    },
  };
}
