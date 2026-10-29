import React from "react";
import { cookies } from "next/headers";
import { getSessionUser } from "@/auth";
import { AppShell } from "@/components/app";

export const metadata = {
  title: "Dashboard",
  description: "Evidence-first security verification dashboard",
};

export default async function DashboardLayout({ children }) {
  const user = await getSessionUser();
  const cookieStore = await cookies();
  const savedTheme = cookieStore.get("patchproof_theme")?.value || "dark";

  return (
    <div data-theme={savedTheme}>
      <AppShell user={user}>{children}</AppShell>
    </div>
  );
}
