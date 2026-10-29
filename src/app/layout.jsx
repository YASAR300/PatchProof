import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://patchproof.dev";

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "PatchProof — Evidence-First Security Verification",
    template: "%s | PatchProof",
  },
  description:
    "PatchProof discovers vulnerabilities, reproduces them with controlled tests, validates that a patch really fixes them without breaking normal behavior, and monitors future pull requests for regressions.",
  keywords: [
    "security verification",
    "vulnerability reproducer",
    "patch validation",
    "continuous security monitoring",
    "automated exploit testing",
    "regression prevention",
    "application security",
  ],
  authors: [{ name: "PatchProof Team" }],
  creator: "PatchProof",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "PatchProof",
    title: "PatchProof — Evidence-First Security Verification",
    description:
      "Don't just find vulnerabilities. Prove they're fixed. Controlled exploit tests, before-and-after patch verification, and regression monitors for every pull request.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "PatchProof — Evidence-First Security Verification",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PatchProof — Evidence-First Security Verification",
    description:
      "Don't just find vulnerabilities. Prove they're fixed. Deterministic exploit test verification and regression prevention.",
    images: ["/opengraph-image"],
    creator: "@patchproof",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans min-h-screen bg-background text-text antialiased selection:bg-accent/20 selection:text-accent">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
