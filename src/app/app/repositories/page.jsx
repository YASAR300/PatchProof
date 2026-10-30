import React from "react";
import { requireUser } from "@/auth";
import { getUserProjects } from "@/lib/projects";
import { RepositoriesClient } from "./RepositoriesClient";

export const metadata = {
  title: "Repositories",
  description: "Monitored repositories with automated verification harnesses",
};

export default async function RepositoriesPage() {
  const user = await requireUser();
  const projects = await getUserProjects(user.id);

  return <RepositoriesClient initialProjects={projects} />;
}
