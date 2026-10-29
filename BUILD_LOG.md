# PatchProof Build Log

## Decisions and assumptions

1. **Framework & Architecture**: Next.js 15 (App Router) in pure JavaScript (`.jsx` for components, `.js` for utilities and routes). No TypeScript as specified.
2. **Path Aliasing**: `jsconfig.json` configured with `@/*` pointing to `src/*`.
3. **Styling & Theming**: Tailwind CSS v3 configured with custom CSS variables in `src/app/globals.css`. Switched via `data-theme="light"` (Apple-inspired light canvas) and `data-theme="dark"` (Linear-inspired calm dark palette).
4. **Semantic Color Mapping**: Defined as a single source of truth in `src/lib/constants.js`:
   - `REPRODUCED` = red
   - `NOT_REPRODUCED` = green
   - `INCONCLUSIVE` = amber
   - `EXECUTION_ERROR` = gray
   - `FIX_VERIFIED` = green
   - `PATCH_NOT_VERIFIED` = red
   - `REGRESSION_FAILURE` = orange
   - `UNVERIFIED` = neutral
   - Severities (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO`) each mapped to distinct colors.
5. **Reduced Motion**: Enforced via global CSS media query `@media (prefers-reduced-motion: reduce)` disabling transitions and animations.
6. **Environment Separation**: `/dev/ui` conditionally checks `process.env.NODE_ENV === 'production'` and triggers `notFound()` to issue a 404 in production builds.
7. **Git Remote**: Linked to `https://github.com/YASAR300/PatchProof.git`.

---

## Step 1: Project Foundation & Design System (2026-10-29)

### What was built
- Initialized Next.js App Router project foundation with pure JavaScript, Tailwind CSS, Lucide icons, Framer Motion, and PostCSS.
- Configured Inter and JetBrains Mono fonts via `next/font`.
- Established `src/lib/cn.js` combining `clsx` and `tailwind-merge`.
- Established central constants (`src/lib/constants.js`) mapping all verification statuses and severities.
- Built complete suite of 14 UI primitives in `src/components/ui`:
  - `Button` (variants: primary, secondary, ghost, danger; sizes: sm, md, lg; loading state)
  - `Badge` (default, outline, accent, muted; sm, md)
  - `StatusBadge` (handles all 8 verification statuses with matching icons & semantic tokens)
  - `SeverityBadge` (CRITICAL, HIGH, MEDIUM, LOW, INFO)
  - `Card` (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
  - `Input` (labels, error states, helper texts, prefix/suffix icons)
  - `Textarea` (standard and monospace modes, error states)
  - `Select` (custom chevron, options list)
  - `Tabs` (Tabs, TabsList, TabsTrigger, TabsContent)
  - `Tooltip` (multi-directional with hover/focus events)
  - `Kbd` (keyboard indicator)
  - `Skeleton` (animated loading pulse)
  - `EmptyState` (icon, title, description, action slot)
  - `Dialog` (accessible modal dialog with backdrop and escape handling)
  - `Toast` (ToastProvider and useToast hook with 4 toast variants)
- Implemented `/` placeholder route with wordmark and step 2 teaser.
- Implemented `/dev/ui` kitchen-sink route demonstrating all primitives, badges, and real-time light/dark theme toggle (404 in production).
- Implemented `/api/health` JSON status endpoint returning `{ status: 'ok', app: 'patchproof', version, time }`.

### Files added
- `.env.example`
- `.gitignore`
- `BUILD_LOG.md`
- `eslint.config.mjs`
- `jsconfig.json`
- `package.json`
- `postcss.config.mjs`
- `README.md`
- `tailwind.config.js`
- `src/app/globals.css`
- `src/app/layout.jsx`
- `src/app/page.jsx`
- `src/app/api/health/route.js`
- `src/app/dev/ui/page.jsx`
- `src/app/dev/ui/DevUiClient.jsx`
- `src/components/app/index.js`
- `src/components/landing/index.js`
- `src/components/ui/index.js`
- `src/components/ui/Badge.jsx`
- `src/components/ui/Button.jsx`
- `src/components/ui/Card.jsx`
- `src/components/ui/Dialog.jsx`
- `src/components/ui/EmptyState.jsx`
- `src/components/ui/Input.jsx`
- `src/components/ui/Kbd.jsx`
- `src/components/ui/Select.jsx`
- `src/components/ui/SeverityBadge.jsx`
- `src/components/ui/Skeleton.jsx`
- `src/components/ui/StatusBadge.jsx`
- `src/components/ui/Tabs.jsx`
- `src/components/ui/Textarea.jsx`
- `src/components/ui/Toast.jsx`
- `src/components/ui/Tooltip.jsx`
- `src/lib/cn.js`
- `src/lib/constants.js`

### Known limitations
- Authentication and backend verification runners are not yet wired up (scheduled for subsequent steps).
- The `/dev/ui` route is restricted to non-production environments.

---

## Step 2: Landing Page Part 1 (2026-10-29)

### Decisions and assumptions
- Light theme is strictly enforced on `/` via container attribute `data-theme="light"` and programmatic synchronization, while embedded dashboard mockups leverage scoped `data-theme="dark"` for authentic Linear-style visuals.
- Nav links `#product`, `#evidence`, `#security`, and `#pricing` fail silently when clicked until their respective target sections are added in Step 3.
- All product visuals are composed purely from JSX, CSS, and SVG without any external image dependencies.
- All animations use `framer-motion` and strictly respect `prefers-reduced-motion`.

### What was built
- **Navbar** (`src/components/landing/Navbar.jsx`):
  - Sticky glass effect with backdrop blur.
  - 1px bottom border appearing dynamically upon scroll.
  - PatchProof wordmark with custom shield-check SVG logo.
  - Smooth-scroll anchor links (failing silently for future sections).
  - 'Sign in' (`/login`) and 'Get started' (`/signup`) action buttons.
  - Mobile responsive drawer/sheet with animated open/close transition.
- **Hero** (`src/components/landing/Hero.jsx`):
  - Small pill tag: "Evidence-first security verification".
  - Large headline with clamp typography and soft gradient on "Prove they're fixed."
  - Two-line subheadline and primary/secondary CTAs ("Start verifying" and "See how it works").
  - Realistic dark Linear-style dashboard mockup inside a window frame:
    - Sidebar with workspace navigation.
    - Findings list with severity and status badges.
    - Selected finding panel featuring automated reproduction test logs and verification matrix.
    - Perspective tilt flattening smoothly on scroll.
    - Two floating chips drifting subtly: "REPRODUCED on a1b2c3d" and "FIX_VERIFIED for tested cases".
- **Open Tooling Strip** (`src/components/landing/OpenToolingStrip.jsx`):
  - Clean text-only display of Semgrep, OSV, GitHub, and Git without logos or partnership claims.
- **Problem Section** (`src/components/landing/ProblemSection.jsx`):
  - Bold headline: "Alerts are not evidence."
  - Three scroll-revealed statements addressing scanner false positives, unproven fixes, and silent security regressions.
- **Four-Act Sticky Storytelling Section** (`src/components/landing/WorkflowSection.jsx`, `id="workflow"`):
  - Four distinct verification acts: Find, Prove, Fix, Evidence.
  - Left column: large interactive text acts highlighting as the user scrolls or clicks.
  - Right column: sticky panel dynamically swapping content per act (code finding, container reproduction log, before/after validation matrix, cryptographic evidence report).
- **Landing Page Composition** (`src/app/page.jsx`):
  - Assembled all 5 components in order.
  - Enforced light theme throughout the route.

### Files added / modified
- `src/app/globals.css` (modified to support scoped `[data-theme="light"]` and `[data-theme="dark"]`)
- `src/components/landing/Navbar.jsx` (added)
- `src/components/landing/Hero.jsx` (added)
- `src/components/landing/OpenToolingStrip.jsx` (added)
- `src/components/landing/ProblemSection.jsx` (added)
- `src/components/landing/WorkflowSection.jsx` (added)
- `src/components/landing/index.js` (modified)
- `src/app/page.jsx` (modified)
- `BUILD_LOG.md` (modified)

### Known limitations
- Authentication routes (`/login`, `/signup`) arrive in step 5.
- The `/dev/ui` route is restricted to non-production environments.

---

## Step 3: Landing Page Part 2 & SEO (2026-10-29)

### Decisions and assumptions
- Added remaining 8 sections in the exact requested order with full Apple-inspired light styling (except the dedicated dark Security Model section).
- Every product visual across all 7 bento cards and evidence matrices is built purely from JSX, CSS, and SVG without any external image files.
- The security model explicitly communicates that containers alone are not treated as a complete security boundary, detailing the defense-in-depth confinement model.
- Dynamic metadata generation using `next/og` (`ImageResponse`) was adopted for `icon.jsx` (32x32 favicon) and `opengraph-image.jsx` (1200x630 social card).
- All internal footer and navbar anchor links now resolve to live sections (`#product`, `#evidence`, `#security`, `#pricing`, `#faq`, `#workflow`).

### What was built
- **Features Bento Grid** (`src/components/landing/FeaturesBentoGrid.jsx`, `id="product"`):
  - 7 cards of varied spans with interactive JSX/SVG visuals: Repository Security Scanner, Automated Vulnerability Verification, Patch Validation, AI Security Assistant, Dependency Intelligence, Continuous Security Monitoring, Security Evidence Dashboard.
- **Verification Matrix** (`src/components/landing/VerificationMatrixSection.jsx`, `id="evidence"`):
  - Large animated before-and-after table comparing Vulnerable version vs Candidate patch across security reproducers and normal functionality.
  - Status explainer for `REPRODUCED`, `NOT_REPRODUCED`, `INCONCLUSIVE`, and `EXECUTION_ERROR`.
  - Stated principle: "Not reproduced does not automatically mean false positive."
  - Patch verdict chips: `FIX_VERIFIED`, `PATCH_NOT_VERIFIED`, and `REGRESSION_FAILURE`.
- **Provenance Section** (`src/components/landing/ProvenanceSection.jsx`):
  - Three-column transparency panel isolating "From the scanner", "Verified by a test", and "Written by AI".
- **Security Model** (`src/components/landing/SecurityModelSection.jsx`, `id="security"`):
  - Dark full-width section detailing isolated workers, network disconnection, resource limits, secretless execution, ephemeral teardowns, and immutable audit logs.
  - Prominent honest note: "Containers alone are not treated as a complete security boundary."
- **'Who it is for'** (`src/components/landing/AudienceSection.jsx`):
  - 4 audience cards: SaaS engineering teams, software companies, open-source maintainers, application-security teams.
- **Pricing** (`src/components/landing/PricingSection.jsx`, `id="pricing"`):
  - 3 planned tiers: Free developer, Team, Enterprise with "Planned" tags and "Join early access" CTAs to `/signup`.
- **FAQ Accordion** (`src/components/landing/FaqSection.jsx`, `id="faq"`):
  - 6 interactive questions addressing scanner replacement, security guarantees, code execution, AI keys, language support, and code storage.
- **Final CTA & Footer** (`src/components/landing/FooterSection.jsx`):
  - Final conversion band, active anchor navigation columns, and credit: "PatchProof — built at Hacker House Goa".
- **SEO Suite**:
  - `src/app/sitemap.js` (valid dynamic sitemap).
  - `src/app/robots.js` (crawling directives).
  - `src/app/icon.jsx` (dynamic 32x32 shield favicon).
  - `src/app/opengraph-image.jsx` (dynamic 1200x630 social card with next/og).
  - Comprehensive OpenGraph and Twitter metadata in `src/app/layout.jsx`.

### Files added / modified
- `src/components/landing/FeaturesBentoGrid.jsx` (added)
- `src/components/landing/VerificationMatrixSection.jsx` (added)
- `src/components/landing/ProvenanceSection.jsx` (added)
- `src/components/landing/SecurityModelSection.jsx` (added)
- `src/components/landing/AudienceSection.jsx` (added)
- `src/components/landing/PricingSection.jsx` (added)
- `src/components/landing/FaqSection.jsx` (added)
- `src/components/landing/FooterSection.jsx` (added)
- `src/components/landing/index.js` (modified)
- `src/app/page.jsx` (modified)
- `src/app/layout.jsx` (modified)
- `src/app/sitemap.js` (added)
- `src/app/robots.js` (added)
- `src/app/icon.jsx` (added)
- `src/app/opengraph-image.jsx` (added)
- `BUILD_LOG.md` (modified)

### Known limitations
- Authentication routes (`/login`, `/signup`) arrive in step 5.
- Dynamic backend job runners for execution sandboxes arrive in later steps.


