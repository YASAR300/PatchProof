"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { z } from "zod";
import {
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export function LoginForm({ hasGithubAuth = true }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/app";
  const registered = searchParams.get("registered");

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="w-full max-w-[420px] mx-auto">
      {/* Decorative Brand Header */}
      <div className="text-center mb-8 space-y-2.5">
        <Link
          href="/"
          className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#0b0b0c] text-white shadow-md hover:scale-105 transition-all group"
        >
          <ShieldCheck className="w-6 h-6 text-[#3b82f6] group-hover:scale-110 transition-transform" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0b0b0c]">
            Welcome to PatchProof
          </h1>
          <p className="text-xs text-[#64748b] mt-1">
            Deterministic security verification & patch proofing
          </p>
        </div>
      </div>

      {/* Main Elevated Card */}
      <div className="p-7 sm:p-8 rounded-[20px] border border-[#e2e8f0] bg-white shadow-[0_20px_45px_rgba(15,23,42,0.06)] text-[#0b0b0c] space-y-6">
        {/* Registration Success Banner */}
        {registered && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>Account created successfully! Please sign in with your password.</span>
          </div>
        )}

        {/* Server Error Alert */}
        {serverError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {/* 1. DIRECT GITHUB 1-CLICK LOGIN AT THE TOP */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGithubSignIn}
            disabled={isLoading || isGithubLoading}
            className="w-full h-11 px-4 rounded-xl bg-[#0b0b0c] hover:bg-[#1f2937] active:bg-[#111827] text-white text-[13px] font-semibold transition-all shadow-sm hover:shadow flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {isGithubLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 fill-white flex-shrink-0 group-hover:scale-110 transition-transform"
                aria-hidden="true"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            )}
            <span>Continue with GitHub</span>
          </button>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#64748b]">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Recommended for 1-click repository import</span>
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center py-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[#e2e8f0]" />
          </div>
          <span className="relative bg-white px-3 text-[11px] uppercase tracking-wider text-[#94a3b8] font-mono">
            or continue with email
          </span>
        </div>

        {/* 2. Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#1e293b]">
              Email address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                name="email"
                type="email"
                placeholder="developer@company.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading || isGithubLoading}
                autoComplete="email"
                required
                className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-[#cbd5e1] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 bg-white text-xs text-[#0f172a] placeholder:text-[#94a3b8] outline-none transition-all"
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.email}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#1e293b]">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading || isGithubLoading}
                autoComplete="current-password"
                required
                className="w-full h-10 pl-10 pr-10 rounded-xl border border-[#cbd5e1] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 bg-white text-xs text-[#0f172a] placeholder:text-[#94a3b8] outline-none transition-all font-mono text-[13px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569] p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.password}</p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || isGithubLoading}
              className="w-full h-10 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white text-xs font-semibold transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in with password</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Switch Link */}
        <div className="pt-2 text-center text-xs text-[#64748b] border-t border-[#f1f5f9]">
          Don't have an account yet?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[#2563eb] hover:text-[#1d4ed8] hover:underline"
          >
            Create an account
          </Link>
        </div>
      </div>

      {/* Security Trust Badges */}
      <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-[#94a3b8]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Isolated Sandboxes</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>256-Bit Encrypted</span>
        </div>
      </div>
    </div>
  );
}
