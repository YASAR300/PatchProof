# PatchProof Landing Page Design Brief (Prompt 24 Reference Parity)

## 1. Overview & Core Philosophy
This landing page aligns PatchProof's visual architecture, rhythm, grid, and UX interactions 1:1 with modern best-in-class security tooling (specifically calibrated against the Semgrep architecture in `docs/reference/`), while strictly using **PatchProof's authentic content, brand identity, and color system**.

### Key Rules
- **No Glow / No Neon / No Flashing**: Flat solid colors, neutral low-contrast shadows for large product frames.
- **Icon + Text Label Statuses**: Never rely on color alone.
- **Zero False Claims**: Honest evidence-first copy. All product scenes carry the small caption: *"Illustrative, not a live scan."* The disclaimer *"Containers alone are not treated as a complete security boundary."* and *"Static analysis only. Test execution is disabled for this repository."* are kept where applicable. 'Safe to merge' is always qualified with 'for tested cases'.
- **Pure Code Visuals**: All product scenes, badges, and diagrams are built in JSX, CSS, and SVG. No static raster screenshots of external apps.
- **Brand Palette (PatchProof)**:
  - Base canvas: near-white `#fbfbfd`
  - Soft indigo tint band: `#eef0ff` (replaces reference's mint tint)
  - Surface white cards: `#ffffff` with subtle neutral border `rgba(11, 11, 13, 0.08)`
  - Deep dark footer & code panels: near-black `#0b0b0c` / `#111113`
  - Accent color: Electric indigo `#5b6cff` (hover `#4857e6`) for CTAs, active indicators, and focus outlines.

---

## 2. Section Parity Map

| # | Section Name | Layout Pattern | Background | PatchProof Parity Content |
|---|---|---|---|---|
| **0** | **Announcement Bar & Secondary Nav** | Full-width slim strip + top utility row | Tinted `#eef0ff` / border `#d8dbf8` | Early access notification, "How it works" link (scrolls to #workflow), dismiss button (sessionStorage), utility links: Sign in, Pricing, FAQ |
| **1** | **Main Navbar** | Sticky 72px flex header with mega menus | White `#ffffff` / subtle shadow | Brand lockup left, Mega menus (Product, Workflow, Security, Resources, Pricing), CTAs right ("Start verifying", "Sign in"). Mobile full-screen accordion sheet. |
| **2** | **Hero** | Centered 12-col + inline email pill + 3-card showcase | Neutral `#fbfbfd` | H1 with 2 weights ("Don't just find vulnerabilities." / **"Prove they're fixed."**), sub-header, joined email pill CTA navigating to `/signup?email=`, 3-card deck (Findings, RunLog, PatchMatrix) with 3 metadata captions. |
| **3** | **Tooling Strip** | Horizontal flex chips band | Tinted `#eef0ff` | 8 plain-text chips with icons: Semgrep rules, SARIF import, OSV advisories, GitHub pull requests, requirements.txt, package-lock.json, pnpm-lock.yaml, Git history. |
| **4** | **Why PatchProof** | Wide content container (~1100px) | White `#ffffff` | Eyebrow "Why PatchProof", title "Built for developers, trusted by security", full FindingsScene dashboard frame with soft tinted wash. |
| **5** | **Icon Grid** | 4-column flat grid (no borders) | White `#ffffff` | 4 pillars: Evidence not alerts, Reproduce before you trust, Verify the fix not just the finding, Proof that stays. |
| **6** | **Tabbed Panel** | Centered pill tablist + 2-col content card | Tint gradient band `#eef0ff` | Title "From alert to evidence, end to end". Pill tabs: Find, Prove, Fix. 200ms crossfade, full ARIA roles & keyboard navigation. |
| **7** | **Lifecycle with Sticky Pill Nav** | Sticky scroll-spy pill bar + 4 alternating 2-col rows | White `#ffffff` | 4 lifecycle stages: Detection (`#detect`), Reproduction (`#prove`), Patch validation (`#validate`), Monitoring (`#monitor`). Text col (4 cols) & visual col (7 cols). Second and fourth rows reversed. |
| **8** | **Works with your Workflow** | 2-column split (bullet list + diagram) | Neutral `#fbfbfd` | Left: "Works where you build" honest capability list. Right: ConnectorGrid with generic tool nodes around centered PatchProof mark. |
| **9** | **Built for Every Role** | 3-column card row | White `#ffffff` | Developers, AppSec teams, Open source maintainers. |
| **10** | **Evidence Switcher** | 3 large factual numerals + 7s auto-advancing switcher | Tint band `#eef0ff` | "What a verification report shows". Numerals: 4 statuses, 3 labeled sources, 1 report per fix. Switcher: Reproduced, Fix verified, Patch not verified with auto-advancing progress bars (pausable). |
| **11** | **Execution Hardening** | 2 columns (checklist + SandboxDiagram) | Tinted `#eef0ff` | "Tests run in isolated, disposable workers". Dedicated workers, network isolation, resource limits, SandboxDiagram, disclaimer. |
| **12** | **Plans and FAQ** | 3-column plan cards + 6-item accordion | White `#ffffff` | Planned tiers (Free developer, Team, Enterprise) + accessible 6-item FAQ accordion answering honest technical questions. |
| **13** | **CTA Section** | Centered copy + email pill + concentric rings motif | Tinted `#eef0ff` | "Prove your next fix", joined email field, "No credit card. Demo project included.", decorative flat commit rings vector illustration. |
| **14** | **Dark Footer** | Multi-column dark panel | Near-black `#0b0b0c` | Logo, tagline, 4 anchor columns, "Ready to verify your first fix?" action row, legal notice. |

---

## 3. Grid, Spacing & Calibration Metrics

- **Max Container Width**: `1240px` (fluid with `px-4 sm:px-6 lg:px-8`).
- **12-Column Grid**: `gap-6` or `gap-8` on desktop, stacking vertically on mobile (`< 1024px`).
- **Section Vertical Padding**:
  - Desktop: `120px` to `140px` (`py-28 sm:py-32`)
  - Mobile: `72px` to `80px` (`py-16 sm:py-20`)
- **Border Radii**:
  - Buttons: `10px` (`rounded-[10px]`)
  - Product Frames & Scenes: `16px` to `24px` (`rounded-[20px]`)
  - Cards & Panels: `12px` to `16px`
  - Badges & Pills: `6px` or `rounded-full` for search/pill controls.
- **Type Scale**:
  - H1: `64px` to `72px` (leading `1.05`, tracking `-0.035em`)
  - H2 (Section Titles): `40px` to `48px` (leading `1.15`, tracking `-0.025em`)
  - H3 (Feature Titles): `24px` to `28px`
  - Sub-headers: `18px` to `20px`
  - Body Text: `16px` to `17px`
  - Eyebrows: `12px` uppercase (weight `600`, tracking `0.1em`)
  - UI / Scene Code Text: `12px` to `13px` monospace with `tabular-nums`.

---

## 4. Key Interactive Behaviors
1. **Mega Menus**: Open on mouse hover or on keyboard Enter/Space with `aria-expanded="true"`. Escape closes and returns focus to the trigger button. Arrow keys traverse menu items. Closes on click outside.
2. **Hero Inline Email Form**: Validates format, directs user to `/signup?email=<encoded>`, where the signup page automatically pre-fills the email field.
3. **Tabbed Lifecycle Panel**: Uses `tablist`, `tab`, `tabpanel` ARIA semantics. ArrowLeft/ArrowRight change active tab. 200ms crossfade between panels.
4. **Lifecycle Scroll-Spy Sticky Pills**: Sticky header pill bar detects which of the 4 sections (`#detect`, `#prove`, `#validate`, `#monitor`) is in view and highlights the active pill. Smooth-scrolls to target on click.
5. **Auto-Advancing Evidence Switcher**: 3 states (Reproduced, Fix verified, Patch not verified) advance every 7 seconds with animated progress bars. Pauses on hover or focus, disabled if `prefers-reduced-motion` is active.
6. **FAQ Accordion**: Single-expand accordion with smooth height transition and keyboard accessibility.
