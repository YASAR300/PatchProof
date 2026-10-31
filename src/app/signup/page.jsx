import React, { Suspense } from "react";
import { SignupForm } from "./SignupForm";

export const metadata = {
  title: "Create Account",
  description: "Sign up for PatchProof to start verifying vulnerabilities.",
};

export default function SignupPage() {
  const hasGithubAuth = Boolean(
    process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
  ) || true;

  return (
    <div
      className="min-h-screen bg-[#f8fafc] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.1),rgba(255,255,255,0))] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#2563eb]/15 selection:text-[#2563eb]"
      data-theme="light"
    >
      <Suspense fallback={<div className="text-center text-xs text-[#94a3b8]">Loading...</div>}>
        <SignupForm hasGithubAuth={hasGithubAuth} />
      </Suspense>
    </div>
  );
}
