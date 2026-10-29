import React, { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Sign in",
  description: "Sign in to your PatchProof security verification account.",
};

export default function LoginPage() {
  const hasGithubAuth = Boolean(
    process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
  );

  return (
    <div
      className="min-h-screen bg-[#fbfbfd] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#0071e3]/15 selection:text-[#0071e3]"
      data-theme="light"
    >
      <Suspense fallback={<div className="text-center text-xs text-[#86868b]">Loading...</div>}>
        <LoginForm hasGithubAuth={hasGithubAuth} />
      </Suspense>
    </div>
  );
}
