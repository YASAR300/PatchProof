"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";

export function SemgrepGetStartedForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push(`/signup?email=${encodeURIComponent(formData.email)}`);
  };

  return (
    <section className="py-24 sm:py-32 bg-[#e2efe7] text-[#0e261d] select-none border-t border-[#c8e2d4]">
      <div className="max-w-[760px] mx-auto px-4 sm:px-6 space-y-16">
        {/* White Form Card */}
        <div className="p-8 sm:p-12 rounded-[32px] bg-white border border-[#b8dcce] shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[12px] font-mono uppercase tracking-widest text-[#008456] font-bold">
              Immediate Onboarding
            </span>
            <h2 className="text-[32px] sm:text-[40px] font-extrabold text-[#0e261d] tracking-tight">
              Start verifying code security today
            </h2>
            <p className="text-[16px] text-[#475569]">
              Connect your repository and eliminate alert noise in under 5 minutes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-[#0e261d] mb-1.5">
                  First name
                </label>
                <input
                  type="text"
                  placeholder="Jane"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full h-11 px-4 rounded-[12px] border border-[#cbd5e1] text-[14px] text-[#0e261d] focus:outline-none focus:border-[#008456] focus:ring-2 focus:ring-[#008456]/20"
                  required
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#0e261d] mb-1.5">
                  Last name
                </label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full h-11 px-4 rounded-[12px] border border-[#cbd5e1] text-[14px] text-[#0e261d] focus:outline-none focus:border-[#008456] focus:ring-2 focus:ring-[#008456]/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#0e261d] mb-1.5">
                Work email
              </label>
              <input
                type="email"
                placeholder="developer@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-11 px-4 rounded-[12px] border border-[#cbd5e1] text-[14px] text-[#0e261d] focus:outline-none focus:border-[#008456] focus:ring-2 focus:ring-[#008456]/20"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#0e261d] mb-1.5">
                Company name
              </label>
              <input
                type="text"
                placeholder="Acme Systems"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full h-11 px-4 rounded-[12px] border border-[#cbd5e1] text-[14px] text-[#0e261d] focus:outline-none focus:border-[#008456] focus:ring-2 focus:ring-[#008456]/20"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full h-12 rounded-full text-[15px] font-bold bg-[#008456] hover:bg-[#006b45] text-white shadow-md transition-all hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
              >
                Get started for free
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-[12px] text-[#64748b]">
              <span>✓ Free for open-source repositories</span>
              <span>✓ Connect in 60 seconds</span>
              <span>✓ No credit card required</span>
            </div>
          </form>
        </div>

        {/* Semgrep Signature Conduit Rings Illustration */}
        <div className="flex items-center justify-center pt-8">
          <svg
            className="w-full max-w-[520px] h-[100px]"
            viewBox="0 0 520 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Horizontal Track Line */}
            <line x1="20" y1="50" x2="500" y2="50" stroke="#94a3b8" strokeWidth="3" strokeDasharray="6 6" />
            <line x1="40" y1="50" x2="480" y2="50" stroke="#008456" strokeWidth="2" />

            {/* Left Orange Ring */}
            <g transform="translate(140, 20)">
              <ellipse cx="25" cy="30" rx="20" ry="28" fill="#ea580c" stroke="#9a3412" strokeWidth="2" />
              <ellipse cx="25" cy="30" rx="14" ry="20" fill="#fed7aa" />
              <ellipse cx="25" cy="30" rx="7" ry="11" fill="#ea580c" />
            </g>

            {/* Center Orange Ring */}
            <g transform="translate(235, 20)">
              <ellipse cx="25" cy="30" rx="20" ry="28" fill="#ea580c" stroke="#9a3412" strokeWidth="2" />
              <ellipse cx="25" cy="30" rx="14" ry="20" fill="#fed7aa" />
              <ellipse cx="25" cy="30" rx="7" ry="11" fill="#ea580c" />
            </g>

            {/* Right Orange Ring */}
            <g transform="translate(330, 20)">
              <ellipse cx="25" cy="30" rx="20" ry="28" fill="#ea580c" stroke="#9a3412" strokeWidth="2" />
              <ellipse cx="25" cy="30" rx="14" ry="20" fill="#fed7aa" />
              <ellipse cx="25" cy="30" rx="7" ry="11" fill="#ea580c" />
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
