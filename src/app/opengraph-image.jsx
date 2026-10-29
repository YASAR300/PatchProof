import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const alt = "PatchProof - Evidence-First Security Verification";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 80px",
          backgroundColor: "#090a0f",
          backgroundImage:
            "radial-gradient(circle at 85% 15%, rgba(99, 102, 241, 0.25) 0%, transparent 50%), radial-gradient(circle at 15% 85%, rgba(0, 113, 227, 0.2) 0%, transparent 50%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#ffffff",
        }}
      >
        {/* Top Bar with Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              backgroundColor: "#0071e3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em" }}>
              PatchProof
            </span>
            <span style={{ fontSize: 13, color: "#8a8f98", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Evidence-First Security Verification
            </span>
          </div>
        </div>

        {/* Center Main Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 960 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              fontSize: 56,
              fontWeight: 700,
              letterSpacing: "-0.035em",
              lineHeight: 1.1,
              color: "#ffffff",
            }}
          >
            <span>Don't just find vulnerabilities.&nbsp;</span>
            <span style={{ color: "#60a5fa" }}>Prove they're fixed.</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: "#9ca3af",
              lineHeight: 1.4,
              maxWidth: 820,
            }}
          >
            <span>
              Controlled exploit tests, before-and-after patch verification, and regression monitors for every pull request.
            </span>
          </div>
        </div>

        {/* Bottom Tags */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 18px",
              borderRadius: 30,
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              color: "#f87171",
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}
          >
            REPRODUCED
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 18px",
              borderRadius: 30,
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              color: "#34d399",
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}
          >
            FIX_VERIFIED
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 16,
              color: "#6b7280",
              marginLeft: "auto",
            }}
          >
            Hacker House Goa &bull; patchproof.dev
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
