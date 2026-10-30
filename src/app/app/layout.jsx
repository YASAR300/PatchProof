import React from "react";
import { cookies } from "next/headers";
import { getSessionUser } from "@/auth";
import { getActiveProject } from "@/lib/projects";
import { AppShell } from "@/components/app";

export const metadata = {
  title: "Dashboard",
  description: "Evidence-first security verification dashboard",
};

export default async function DashboardLayout({ children }) {
  const user = await getSessionUser();
  const cookieStore = await cookies();
  const savedTheme = cookieStore.get("patchproof_theme")?.value || "dark";

  let activeProject = null;
  let userProjects = [];

  if (user?.id) {
    const res = await getActiveProject(cookieStore, user.id);
    activeProject = res.activeProject;
    userProjects = res.userProjects;
  }

  return (
    <div data-theme={savedTheme}>
      <AppShell
        user={user}
        activeProject={activeProject}
        userProjects={userProjects}
      >
        {children}
      </AppShell>
    </div>
  );
}
