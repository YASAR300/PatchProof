import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { ConnectRepositoryForm } from "@/components/app/ConnectRepositoryForm";

export const metadata = {
  title: "Connect Repository",
  description: "Connect a new GitHub repository to PatchProof",
};

export default function NewRepositoryPage() {
  return (
    <div className="max-w-[560px] mx-auto w-full space-y-4 font-sans">
      <div className="mb-1">
        <Link
          href="/app/repositories"
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back to repositories</span>
        </Link>
      </div>

      <PageHeader
        title="Connect GitHub repository"
        description="Provide a public GitHub repository URL to inspect dependencies, detect manifests, and initialize verification posture."
      />

      <Card>
        <CardHeader>
          <CardTitle>Repository configuration</CardTitle>
          <CardDescription>
            Specify the repository to monitor. Only public repositories hosted on github.com are currently supported.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConnectRepositoryForm />
        </CardContent>
      </Card>
    </div>
  );
}
