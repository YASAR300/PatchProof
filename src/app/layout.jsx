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

export const metadata = {
  title: "PatchProof | Evidence-First Security Verification",
  description:
    "Evidence-first security verification platform. Discovers vulnerabilities, reproduces them with controlled tests, validates patches, and prevents regressions.",
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
