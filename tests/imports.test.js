import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      if (!["node_modules", ".next", ".git", ".data"].includes(file)) {
        results = results.concat(walk(full));
      }
    } else if (file.endsWith(".jsx")) {
      results.push(full);
    }
  }
  return results;
}

describe("JSX Component Import Integrity", () => {
  it("ensures every JSX component tag used across all .jsx files is properly imported or declared", () => {
    const files = walk("src");
    const issues = [];

    for (const file of files) {
      const content = fs.readFileSync(file, "utf8");
      const importEndIdx = Math.max(content.lastIndexOf("import "), 0);
      const semiAfter = content.indexOf(";", importEndIdx);
      const newlineAfter = content.indexOf("\n", importEndIdx);
      const endOfImports = Math.max(semiAfter, newlineAfter, 0);

      const header = content.slice(0, endOfImports + 1);
      const body = content.slice(endOfImports + 1);

      const tags = new Set([...body.matchAll(/<([A-Z][a-zA-Z0-9]+)/g)].map((m) => m[1]));

      for (const tag of tags) {
        const isDeclared =
          header.includes(tag) ||
          new RegExp(`(?:function|const|let|var|class|as:|icon:|endIcon:)\\s*\\b${tag}\\b`).test(content) ||
          ["Fragment", "Suspense"].includes(tag);

        if (!isDeclared) {
          issues.push(`${file} uses <${tag}> without importing or declaring it`);
        }
      }
    }

    expect(issues).toEqual([]);
  });
});
