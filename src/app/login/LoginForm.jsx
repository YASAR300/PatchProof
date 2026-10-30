"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { ShieldCheck, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export function LoginForm({ hasGithubAuth }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/app";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const validation = loginSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0]] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
        callbackUrl: nextUrl,
      });

      if (!res || res.error) {
        setServerError("Invalid email address or password. Please try again.");
        setIsLoading(false);
        return;
      }

      router.push(nextUrl);
      router.refresh();
    } catch (err) {
      console.error("Sign-in error:", err);
      setServerError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = () => {
    setIsGithubLoading(true);
    signIn("github", { callbackUrl: nextUrl });
  };

  return (
    <div className="w-full max-w-[400px] mx-auto p-6 sm:p-8 rounded-2xl border border-black/[0.08] bg-white shadow-[0_10px_35px_rgba(0,0,0,0.04)] text-[#1d1d1f]">
      {/* Brand & Title */}
      <div className="text-center mb-8 space-y-2">
        <Link href="/" className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-black text-white shadow-sm mb-2 hover:scale-105 transition-transform">
          <ShieldCheck className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1d1d1f]">
          Welcome back
        </h1>
        <p className="text-xs text-[#334155] leading-relaxed">
          Sign in to your PatchProof security workspace
        </p>
      </div>

      {serverError && (
        <div className="mb-5 p-3 rounded-lg bg-surface-raised border border-border text-xs text-text flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          name="email"
          type="email"
          placeholder="developer@company.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          disabled={isLoading || isGithubLoading}
          autoComplete="email"
          required
        />

        <div className="space-y-1">
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            disabled={isLoading || isGithubLoading}
            autoComplete="current-password"
            required
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={isLoading}
            disabled={isGithubLoading}
            icon={<ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />}
            iconPosition="right"
          >
            Sign in
          </Button>
        </div>
      </form>

      {/* GitHub Provider (when configured) */}
      {hasGithubAuth && (
        <div className="mt-5 space-y-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-black/[0.08]" />
            </div>
            <span className="relative bg-white px-3 text-2xs uppercase tracking-wider text-[#86868b] font-mono">
              or
            </span>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full h-10 rounded-xl border border-black/10 bg-white hover:bg-black/[0.03] text-[#1d1d1f] text-xs font-medium gap-2 shadow-sm"
            onClick={handleGithubSignIn}
            loading={isGithubLoading}
            disabled={isLoading}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>Continue with GitHub</span>
          </Button>
        </div>
      )}

      {/* Switch link */}
      <div className="mt-8 text-center text-xs text-[#86868b]">
        Don't have an account?{" "}
        <Link href="/signup" className="font-semibold text-[#0071e3] hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
}
