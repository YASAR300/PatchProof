import Link from "react";
import { ShieldCheck, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background text-text">
      <div className="max-w-md w-full space-y-8 animate-in fade-in duration-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-surface-raised border border-border flex items-center justify-center shadow-inner">
            <ShieldCheck className="w-6 h-6 text-accent" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-text">PatchProof</h1>
            <p className="text-xs text-text-muted font-mono tracking-wide">
              EVIDENCE-FIRST SECURITY VERIFICATION
            </p>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-border bg-surface shadow-sm space-y-3">
          <p className="text-sm font-medium text-text">Landing page arrives in step 2</p>
          <p className="text-xs text-text-muted leading-relaxed">
            Step 1 establishes the project foundation, semantic design system, verification status
            tokens, and UI primitives.
          </p>

          <div className="pt-2">
            <a
              href="/dev/ui"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-accent bg-accent/10 hover:bg-accent/15 border border-accent/20 rounded-md transition-colors"
            >
              <span>Explore Dev UI Kitchen Sink</span>
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
