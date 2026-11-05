import React from "react";
import { cookies } from "next/headers";
import { Package, Upload } from "lucide-react";
import { requireUser } from "@/auth";
import { prisma } from "@/lib/db";
import { getActiveProject } from "@/lib/projects";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { DependenciesClient } from "./DependenciesClient";

export const metadata = {
  title: "Dependencies — PatchProof",
  description: "Software bill of materials and vulnerability advisory tracking",
};

export default async function DependenciesPage() {
  const user = await requireUser();
  const cookieStore = await cookies();
  const { activeProject } = await getActiveProject(cookieStore, user.id);

  if (!activeProject) {
    return (
      <div className="space-y-4 font-sans w-full max-w-[1200px] mx-auto">
        <PageHeader
          title="Dependencies"
          description="Software bill of materials (SBOM) and reachability analysis distinguishing actual vulnerability vectors from unused code."
        />
        <EmptyState
          icon={<Package className="w-5 h-5 text-text-secondary" />}
          title="No active project selected"
          description="Select or connect a repository to view software dependencies and vulnerability advisories."
        />
      </div>
    );
  }

  // Fetch real dependencies for the active project
  const dependencies = await prisma.dependency.findMany({
    where: { projectId: activeProject.id },
    orderBy: [
      { severity: "desc" },
      { name: "asc" },
    ],
  });

  // Calculate unique metrics
  const packageMap = new Map();
  const directSet = new Set();
  const transitiveSet = new Set();
  const advisorySet = new Set();

  for (const dep of dependencies) {
    packageMap.set(dep.name.toLowerCase(), dep);
    if (dep.isDirect) {
      directSet.add(dep.name.toLowerCase());
    } else {
      transitiveSet.add(dep.name.toLowerCase());
    }
    if (dep.advisoryId) {
      advisorySet.add(dep.name.toLowerCase());
    }
  }

  const summary = {
    packagesScanned: packageMap.size,
    packagesWithAdvisories: advisorySet.size,
    directCount: directSet.size,
    transitiveCount: transitiveSet.size,
  };

  return (
    <DependenciesClient
      initialDependencies={dependencies}
      summary={summary}
      activeProject={activeProject}
    />
  );
}
