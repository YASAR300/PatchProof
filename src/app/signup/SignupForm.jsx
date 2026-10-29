"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { ShieldCheck, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(10, "Password must be at least 10 characters"),
});

export function SignupForm({ hasGithubAuth }) {
  const router = useRouter();

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
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

    const validation = signupSchema.safeParse(formData);
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
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || "Failed to create account. Please try again.");
        setIsLoading(false);
        return;
      }

      // Automatically sign in the new user
      const loginRes = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
        callbackUrl: "/app",
      });

      if (!loginRes || loginRes.error) {
        // Fallback to login page with success flag
        router.push("/login?registered=true");
        return;
      }

      router.push("/app");
      router.refresh();
    } catch (err) {
      console.error("Signup error:", err);
      setServerError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = () => {
    setIsGithubLoading(true);
    signIn("github", { callbackUrl: "/app" });
  };

  return (
    <div className="w-full max-w-[420px] mx-auto p-6 sm:p-8 rounded-2xl border border-black/[0.08] bg-white shadow-[0_10px_35px_rgba(0,0,0,0.04)] text-[#1d1d1f]">
      {/* Brand & Title */}
      <div className="text-center mb-8 space-y-2">
        <Link href="/" className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-black text-white shadow-sm mb-2 hover:scale-105 transition-transform">
          <ShieldCheck className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1d1d1f]">
          Create your account
        </h1>
        <p className="text-xs text-[#86868b] leading-relaxed">
          Start verifying vulnerabilities with executable proof
        </p>
      </div>

      {serverError && (
        <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full name"
          name="name"
          type="text"
          placeholder="Jane Doe"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          disabled={isLoading || isGithubLoading}
          autoComplete="name"
          required
        />

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
            placeholder="At least 10 characters"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            helperText="Minimum 10 characters with numbers or symbols recommended"
            disabled={isLoading || isGithubLoading}
            autoComplete="new-password"
            required
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            className="w-full h-10 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-sm active:scale-[0.99] transition-all"
            loading={isLoading}
            disabled={isGithubLoading}
          >
            <span>Create account</span>
            <ArrowRight className="w-3.5 h-3.5" />
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
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#0071e3] hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
