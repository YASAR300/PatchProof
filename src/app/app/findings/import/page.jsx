import React from "react";
import { requireUser } from "@/auth";
import { getUserProjects } from "@/lib/projects";
import { ImportFindingsClient } from "./ImportFindingsClient";

export const metadata = {
  title: "Import Scanner Report",
  description: "Import external vulnerability reports (SARIF 2.1.0 or Semgrep JSON) into PatchProof.",
};

export default async function ImportFindingsPage() {
  const user = await requireUser();
  const projects = user ? await getUserProjects(user.id) : [];

  return (
    <div className="py-2">
      <ImportFindingsClient projects={projects} initialProjectId={projects[0]?.id || null} />
    </div>
  );
}

