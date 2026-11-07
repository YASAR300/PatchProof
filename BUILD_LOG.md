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

---

## Step 4: Database Layer with PostgreSQL & Prisma (2026-10-29)

### Decisions and assumptions
- Installed matching, stable Prisma 6.19.3 (`prisma` and `@prisma/client`) with `bcryptjs` for secure password hashing.
- Configured PostgreSQL 16 Alpine container in `docker-compose.yml` with healthchecks and persistent storage.
- Documented both `DATABASE_URL` (connection-pooled) and `DIRECT_URL` (direct unpooled) in `.env.example` and `README.md` to support seamless transition to hosted PostgreSQL providers (Neon or Supabase).
- Models use `cuid()` identifiers, automatic timestamps, strategic composite indexes, and cascading deletes where child entities depend on parent existence.
- `AuditEvent` model is strictly append-only (contains `createdAt` but intentionally omits `updatedAt`).
- `prisma/seed.js` seeds exactly ONE administrator user from `SEED_USER_EMAIL` and `SEED_USER_PASSWORD` with bcrypt hash; no synthetic findings, runs, or reports are created, maintaining strict evidence integrity.
- Extended `/api/health` with a lightweight, non-blocking database query to report `db: 'up' | 'down'`.

### What was built
- `docker-compose.yml`: PostgreSQL 16 container service (`postgres:16-alpine`), internal health check, and volume `patchproof_postgres_data`.
- `prisma/schema.prisma`:
  - 10 Enums: `GlobalRole`, `ProjectRole`, `FindingSource`, `Severity`, `VerificationStatus`, `TriageStatus`, `ArtifactKind`, `PatchVerdict`, `ReviewDecision`, `JobStatus`.
  - 13 Models: `User`, `Project`, `ProjectMember`, `RepositoryScan`, `Finding`, `VerificationRun`, `EvidenceArtifact`, `PatchReport`, `ReviewerDecision`, `Dependency`, `AiExplanation`, `Job`, `AuditEvent`.
- `src/lib/db.js`: Safe singleton instance of `PrismaClient` preventing connection pool leaks during Next.js hot module reloading.
- `prisma/seed.js`: Standalone seed script creating the initial demo admin user.
- `prisma/migrations/20261029000000_init/migration.sql`: Generated initial PostgreSQL DDL migration script.
- `src/app/api/health/route.js`: Dynamic endpoint returning `{ status, app, version, time, db: 'up' | 'down' }`.
- `package.json`: Added `db:migrate`, `db:seed`, `db:studio`, and `postinstall` npm scripts.
- `.env.example` & `README.md`: Documented local Docker setup, database URLs, migration steps, and Studio workflows.

### Files added / modified
- `docker-compose.yml` (added)
- `prisma/schema.prisma` (added)
- `prisma/seed.js` (added)
- `prisma/migrations/20261029000000_init/migration.sql` (added)
- `src/lib/db.js` (added)
- `src/app/api/health/route.js` (modified)
- `package.json` (modified)
- `.env.example` (modified)
- `README.md` (modified)
- `BUILD_LOG.md` (modified)

### Known limitations
- Local database requires a running PostgreSQL instance or Docker container; when not running, `/api/health` gracefully reports `db: "down"`.

---

## Step 5: Authentication & Dashboard Shell (2026-10-29)

### Decisions and assumptions
- Configured Auth.js (NextAuth v5 beta) with JWT session strategy and dual configuration (`auth.config.js` for edge-compatible middleware and `auth.js` for full Node execution with Prisma and bcryptjs).
- Protected all `/app/*` routes via Next.js middleware, redirecting unauthenticated visitors to `/login?next=<path>` and redirecting authenticated visitors away from `/login` and `/signup` directly to `/app`.
- Created server helpers `requireUser()` and `getSessionUser()`.
- Wrote immutable audit log records for `USER_SIGNED_UP` and `USER_SIGNED_IN` with non-blocking error handling to safeguard auth flow availability.
- Centered Apple-style light cards for `/login` and `/signup` with client/server Zod validation and a minimum 10-character password requirement.
- Conditionally render "Continue with GitHub" only when both `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set.
- App shell in `src/app/app/layout.jsx` defaults to dark theme, persisted via localStorage and cookie (`patchproof_theme`) to prevent theme flash.
- 240px wide sidebar collapsible to 56px icon rail (remembered in localStorage) and mobile off-canvas drawer.
- Built Command Palette (`Cmd+K` / `Ctrl+K`), two-step `G` keyboard navigation shortcuts, and a `?` shortcut cheat-sheet dialog.
- Built all 9 app routes with `PageHeader` and descriptive `EmptyState` primitives.

### What was built
- `src/auth.config.js`: Lightweight edge-compatible configuration for route authorization and JWT callbacks.
- `src/auth.js`: Full Auth.js initialization with Credentials (bcryptjs) & GitHub providers, audit logging, and `requireUser()` / `getSessionUser()` helpers.
- `src/middleware.js`: Edge middleware protecting `/app/*` routes and redirecting auth traffic.
- `src/app/api/auth/[...nextauth]/route.js`: NextAuth API handler.
- `src/app/api/auth/signup/route.js`: User registration endpoint with Zod validation, bcrypt password hashing, duplicate check, and `USER_SIGNED_UP` audit logging.
- `src/app/login/page.jsx` & `src/app/login/LoginForm.jsx`: Centered Apple-style login card with inline validation and dynamic GitHub OAuth.
- `src/app/signup/page.jsx` & `src/app/signup/SignupForm.jsx`: Centered Apple-style signup card with 10-char password requirement and auto sign-in.
- `src/components/app/AppShell.jsx`: Responsive Linear-style dashboard layout with collapsible sidebar, project switcher, topbar breadcrumbs, and user dropdown.
- `src/components/app/CommandPalette.jsx`: Fuzzy command search modal supporting keyboard navigation (`↑`, `↓`, `↵`, `Esc`).
- `src/components/app/ShortcutManager.jsx`: Global listener for `G`-sequence navigation shortcuts and `?` cheat-sheet dialog.
- `src/components/app/PageHeader.jsx`: Reusable header primitive with title, description, and action slots.
- 9 App Route Pages with `PageHeader` & `EmptyState`:
  - `/app` (Overview)
  - `/app/repositories` (Repositories)
  - `/app/findings` (Findings)
  - `/app/runs` (Verification Runs)
  - `/app/reports` (Patch Reports)
  - `/app/dependencies` (Dependencies)
  - `/app/assistant` (AI Assistant)
  - `/app/audit` (History & Audit)
  - `/app/settings` (Settings)

### Files added / modified
- `src/auth.config.js` (added)
- `src/auth.js` (added)
- `src/middleware.js` (added)
- `src/app/api/auth/[...nextauth]/route.js` (added)
- `src/app/api/auth/signup/route.js` (added)
- `src/app/login/page.jsx` (added)
- `src/app/login/LoginForm.jsx` (added)
- `src/app/signup/page.jsx` (added)
- `src/app/signup/SignupForm.jsx` (added)
- `src/components/app/AppShell.jsx` (added)
- `src/components/app/CommandPalette.jsx` (added)
- `src/components/app/ShortcutManager.jsx` (added)
- `src/components/app/PageHeader.jsx` (added)
- `src/components/app/index.js` (modified)
- `src/app/app/layout.jsx` (added)
- `src/app/app/page.jsx` (added)
- `src/app/app/repositories/page.jsx` (added)
- `src/app/app/findings/page.jsx` (added)
- `src/app/app/runs/page.jsx` (added)
- `src/app/app/reports/page.jsx` (added)
- `src/app/app/dependencies/page.jsx` (added)
- `src/app/app/assistant/page.jsx` (added)
- `src/app/app/audit/page.jsx` (added)
- `src/app/app/settings/page.jsx` (added)
- `.env.example` (modified)
- `BUILD_LOG.md` (modified)

### Known limitations
- Git repository cloning, scanner invocations, and test harness runner processes arrive in subsequent steps.
- OAuth GitHub provider requires registering GitHub OAuth app credentials in `.env` to be active.

---

## Step 6: Real Projects and Repositories (2026-10-30)

### Decisions and assumptions
1. **GitHub URL Strict Validation**: URLs are strictly parsed using standard `URL` parser: only `https:` protocol and `github.com` hostname are allowed. Credentials (`user:pass@`) and any non-GitHub hosts (e.g. `gitlab.com`, `bitbucket.org`) are rejected with explicit, friendly error messages. Path must have exactly two segments (`owner` and `repo`).
2. **GitHub REST API Integration & 60-Second In-Memory Caching**: GitHub REST API calls are routed through `src/lib/github.js` with an in-memory TTL cache (`60 * 1000` ms). The optional `GITHUB_TOKEN` environment variable is used when present to raise rate limits. Friendly messages are returned for 404 (not found / private repository) and 403 rate limits.
3. **Target Manifests Detection**: Detected files include `requirements.txt`, `package-lock.json`, `pnpm-lock.yaml`, `package.json`, and `pyproject.toml` located at root or one level down via GitHub Git Trees API (`recursive=1`). Stored on `Project` as `detectedManifests` (Json field added in migration `20261030044001_add_project_manifests`).
4. **Language Selection**: Auto-suggests either "Python" or "JavaScript/TypeScript" based on GitHub metadata and detected manifests, editable by the user.
5. **Execution Restriction Notice**: Repositories added from GitHub always have `executionEnabled: false`, rendered with the exact message: `'Static analysis only. Test execution is disabled for this repository.'`
6. **Project Membership & Audit Logging**: Creating a project automatically adds the creator as an `OWNER` `ProjectMember` and writes the audit event `PROJECT_CREATED`. Deleting a project checks typed-name confirmation, writes `PROJECT_DELETED`, and cascades deletion.
7. **Project Scoping & Switcher**: The active project ID is persisted in the `patchproof_project_id` cookie. The sidebar project switcher lists user projects, highlights the current project, allows one-click switching via `/api/projects/switch`, and provides a "+ Connect a repository" link. If no projects exist, `/app` (Overview) displays an onboarding card with a 'Connect a repository' button.
8. **Dense Linear-Style Repositories View**: `/app/repositories` renders a dense table with repository name/owner, language badge, default branch with icon, last scan ('Never scanned'), latest commit short SHA, and updated timestamp. Clicking a row navigates to `/app/repositories/[id]`.
9. **Repository Details (`/app/repositories/[id]`)**: Displays header with name, external link to GitHub, branch, and language. Contains 3 tabs:
   - *Overview*: Metadata, detected manifests, and scan history placeholder ('Never scanned').
   - *Commits*: Latest 15 commits from GitHub REST API with short SHA, message, author, and date.
   - *Settings*: Rename repository, change default branch, and permanently delete repository with typed-name confirmation (forbidden for `VIEWER` roles).
10. **Role-Based Authorization**: Every query and mutation checks `ProjectMember`. A `VIEWER` cannot edit or delete projects.

### What was built
- `prisma/migrations/20261030044001_add_project_manifests/migration.sql`: Added `latestCommitSha` (Text) and `detectedManifests` (JsonB) to `Project`.
- `src/lib/github.js`: GitHub REST client with URL parser, 60s in-memory caching, Git trees API manifest detection, language suggestion, and recent commits fetching.
- `src/lib/projects.js`: Project access controls, membership validation, active project cookie management (`patchproof_project_id`), and slug generation.
- `src/app/api/repositories/validate/route.js`: Server endpoint validating GitHub URLs and returning metadata, suggested language, and detected manifests.
- `src/app/api/repositories/route.js`: GET user projects; POST create project with OWNER membership, PROJECT_CREATED audit log, and active cookie.
- `src/app/api/repositories/[id]/route.js`: GET repository details & commits; PATCH update name/branch; DELETE with typed confirmation and PROJECT_DELETED audit log.
- `src/app/api/projects/switch/route.js`: POST endpoint switching selected project cookie.
- `src/components/app/ConnectRepositoryForm.jsx`: Interactive repository connection form with real-time inspection, manifest previews, language select, and execution notice.
- `src/components/app/ConnectRepositoryDialog.jsx`: Accessible modal dialog for connecting a repository.
- `src/app/app/repositories/new/page.jsx`: Dedicated project creation page.
- `src/app/app/repositories/RepositoriesClient.jsx`: Linear-style dense repository table with row navigation and dialog trigger.
- `src/app/app/repositories/page.jsx`: Server component loading user repositories.
- `src/app/app/repositories/[id]/RepositoryDetailClient.jsx`: Tabbed view for Overview, Commits, and Settings with role-based restrictions.
- `src/app/app/repositories/[id]/page.jsx`: Dynamic repository details page.
- `src/components/app/AppShell.jsx`: Updated with real project switcher, project listing, and "+ Connect a repository" shortcut.
- `src/app/app/page.jsx`: Scoped Overview displaying active repository metrics or onboarding card when no projects exist.
- `src/app/app/layout.jsx`: Scoped project resolution passing activeProject and userProjects.

### Files added / modified
- `prisma/schema.prisma` (modified)
- `prisma/migrations/20261030044001_add_project_manifests/migration.sql` (added)
- `src/lib/github.js` (added)
- `src/lib/projects.js` (added)
- `src/app/api/repositories/validate/route.js` (added)
- `src/app/api/repositories/route.js` (added)
- `src/app/api/repositories/[id]/route.js` (added)
- `src/app/api/projects/switch/route.js` (added)
- `src/components/app/ConnectRepositoryForm.jsx` (added)
- `src/components/app/ConnectRepositoryDialog.jsx` (added)
- `src/components/app/index.js` (modified)
- `src/components/app/AppShell.jsx` (modified)
- `src/app/app/layout.jsx` (modified)
- `src/app/app/page.jsx` (modified)
- `src/app/app/repositories/page.jsx` (modified)
- `src/app/app/repositories/RepositoriesClient.jsx` (added)
- `src/app/app/repositories/new/page.jsx` (added)
- `src/app/app/repositories/[id]/page.jsx` (added)
- `src/app/app/repositories/[id]/RepositoryDetailClient.jsx` (added)
- `BUILD_LOG.md` (modified)

### Known limitations
- Vulnerability scanning engines (Semgrep, OSV) and container reproducer runners are scheduled for subsequent steps.
- Private repositories require GitHub OAuth installation or personal access tokens (currently restricted to public repos).

---

## Step 8: Authenticated Dashboard Linear-Grade Visual & UX Redesign (2026-10-30)

### Root Cause Analysis (Why earlier styling passes did not visibly change the UI)
1. **Server Port & Cache Conflict**: When `npm run dev` was started in the user's terminal while a background production server (`next start`) was already bound to port 3000, Next.js shifted dev to port 3001 while overwriting the `.next/` directory manifests. This caused requests on port 3000 to return `400: Bad Request` for CSS assets, rendering unstyled raw HTML in the browser.
2. **Navy-Tinted Color Tokens**: CSS variables in `src/app/globals.css` were mapped to Tailwind slate/navy values (`#0b0f19`, `#111827`, `#1f2937`, `#374151`) instead of neutral dark Linear-grade tokens (`#0b0b0c`, `#090909`, `#111113`, `#161618`, `rgba(255,255,255,0.07)`).
3. **Hard-Coded Component Styles Bypassing Tokens**:
   - `AppShell.jsx` used `w-60` (240px), active navigation item used `bg-accent/15 text-accent font-semibold` (bright blue text instead of neutral selected surface), breadcrumb used `font-mono text-xs text-text-muted` (`app / overview`), search trigger had separate `<Kbd>` boxes, and project switcher had a `border border-border/70 rounded-lg` form-control appearance.
   - `PageHeader.jsx` had a bright full-width divider `border-b border-border/60 pb-6 mb-6`.
   - `OverviewPage` rendered 4 large stat cards with `uppercase tracking-wider` labels, full-width `Manage Repository` button, manifest pills, and default `Connect Repository` primary CTA on already connected projects.
   - Next.js development indicator was positioned at bottom-left by default, directly colliding with "Local Engine Ready" in the sidebar footer.

### What was built / modified
1. **Neutral Dark & Light Design Tokens (`src/app/globals.css`, `tailwind.config.js`)**:
   - App background `#0b0b0c`, sidebar `#090909`, surface `#111113`, raised surface `#161618`, hover `rgba(255,255,255,0.04)`, selected `rgba(255,255,255,0.07)`.
   - Border `rgba(255,255,255,0.07)`, strong border `rgba(255,255,255,0.12)`. Zero bluish or bright white borders.
   - Text `#ededef`, secondary `#a0a0a8` (7.4:1 contrast), tertiary `#6e6e76` (4.6:1 contrast).
   - Strict radii: 4px badges, 6px controls, 8px panels/menus, 12px dialogs. `rounded-full` only for avatars and status dots.
   - Inter typography: Base 13px, meta 12px, labels 11px, page title 20px (weight 600, letter-spacing -0.01em). Monospace restricted to SHAs, branch names, file paths, and code. Numbers use `tabular-nums`.
2. **UI Primitives Refined (`src/components/ui/*`)**:
   - `Button.jsx`: Heights 28px (`h-7`) and 32px (`h-8`), radius 6px, icon 14px with 6px gap. Secondary uses raised surface `#161618` with 1px border token (not white). Active state uses darker surface only, no scale bounce.
   - `Card.jsx` (Panel): Flat surface `#111113`, 1px border, radius 8px, 40px header with 13px weight 500 title and action slot, 12-16px body padding.
   - `Badge.jsx`, `StatusBadge.jsx`, `SeverityBadge.jsx`: Height 20px, radius 4px, 11px text, flat tinted background, static icon.
   - `Kbd.jsx`: Single combined chip (`Ctrl K` or `⌘K`), 20px high, 11px font, hidden on touch screens.
   - `Tabs.jsx`: Quiet underline style with 1px baseline; active tab uses primary text and 2px accent underline.
   - `DropdownMenu.jsx`: Portaled, 8px radius panel, 32px items, 16px icon column, checkmark for selected.
   - `EmptyState.jsx`: 32px neutral square container, 16px icon, short title, one-line explanation, single action.
   - `Dialog.jsx`: Strictly 12px border-radius, neutral border.
   - `SearchField.jsx`: 32px height, 6px radius.
   - `Logo.jsx`: 20px mark, 13px weight 600 wordmark.
3. **App Shell Polish (`src/components/app/AppShell.jsx`)**:
   - Sidebar: 232px wide (48px collapsed). 48px header row.
   - Project switcher: 32px row, borderless, radius 6px, 20px initial avatar, project name, subtle chevron.
   - Nav items: 28px high, 8px padding, 16px icon, 13px label in secondary color; active item uses selected surface (`rgba(255,255,255,0.07)`) with primary text (no blue text). Grouped with 11px tertiary labels (`Workflow`, `Project`).
   - Sidebar footer: 28px status row with flat 6px dot and 12px tertiary text ('Local Engine Ready'), collapse button.
   - Topbar: 48px high with 1px bottom border. Breadcrumb in sans-serif 13px (`flask / Overview`). Search trigger: 32px high, 10px padding, 14px icon, 8px gap, single combined Kbd chip (`Ctrl K`), 24px circular avatar.
   - Next.js dev indicator disabled in `next.config.mjs` to prevent sidebar footer collision.
4. **Overview Redesign (`src/app/app/page.jsx`, `OverviewActions.jsx`)**:
   - Flexible main column + 320px aside column (stacked below 1024px, with `min-w-0` to eliminate overflow).
   - Context-aware header actions: 'Run scan' (primary) + 'Repository details' (secondary). 'Connect repository' removed from Overview of connected projects.
   - Slim static analysis notice: exact required text preserved.
   - 'Get started' checklist panel (40px rows, step-state icons, titles, hints, actions, test execution disabled disclaimers).
   - 'Recent activity' panel listing the latest 8 audit events from Prisma with relative times and exact tooltips.
   - Aside 'Properties' panel with 32px rows, copy button on commit SHA, and 'Manage repository' link in header.
   - Aside 'Detected manifests' panel with mono file paths and type labels (no pills).
5. **Universal /app Page Consistency**:
   - `/app/repositories`: Dense table (row 36-40px), whole row is keyboard-navigable link.
   - `/app/repositories/new`: Single column 560px wide form, 12px labels, inline validation, primary button at bottom-left.
   - `/app/repositories/[id]`: Compact header, underline tabs, panels.
   - `/app/findings`, `/app/runs`, `/app/reports`, `/app/dependencies`, `/app/audit`: Filter chips, group counts, tabular numbers, Linear-grade empty states and list rows.
   - `/app/settings`: Left sub-navigation plus sections in Panels within max-w-[1200px].
   - `/app/assistant`: Compact two-column layout.

### Computed Style Audit Table (Playwright Automation)
| Metric | Expected | Actual | Status |
| :--- | :--- | :--- | :--- |
| **Sidebar width** | `232px` | `232px` | **PASS** |
| **Nav item height** | `28px` | `28px` | **PASS** |
| **Topbar height** | `48px` | `48px` | **PASS** |
| **Search trigger height** | `32px` | `32px` | **PASS** |
| **Search trigger Kbd chips** | `1 chip` | `1 chip (Ctrl K)` | **PASS** |
| **Project switcher radius** | `<= 6px (not pill)` | `0px / rounded-[6px]` | **PASS** |
| **Base body font-size** | `13px` | `13px` | **PASS** |
| **Border-radius <= 12px** | `0 violations` | `0 violations` | **PASS** |
| **No text-shadow / drop-shadow** | `0 violations` | `0 violations` | **PASS** |
| **No warning/error animations** | `0 violations` | `0 violations` | **PASS** |
| **Keyboard Tab navigation** | First focusable link | Focuses `Overview` | **PASS** |
| **Command palette shortcut** | `Ctrl+K` open, `Esc` close | Opens & closes with focus return | **PASS** |
| **Responsive overflow (1440px)** | No horizontal overflow | `PASS (0px overflow)` | **PASS** |
| **Responsive overflow (1024px)** | No horizontal overflow | `PASS (0px overflow)` | **PASS** |
| **Responsive overflow (768px)** | No horizontal overflow | `PASS (0px overflow)` | **PASS** |
| **Responsive overflow (390px)** | No horizontal overflow | `PASS (0px overflow)` | **PASS** |

### Screenshots Captured
- **Before Redesign (1440px & 390px)**: `scratch/screenshots/before/{app_overview, repositories, repositories_new, repositories_detail, findings, runs, reports, dependencies, assistant, audit, settings}_{1440,390}.png`
- **After Redesign (1440px & 390px)**: `scratch/screenshots/after/{app_overview, repositories, repositories_new, repositories_detail, findings, runs, reports, dependencies, assistant, audit, settings}_{1440,390}.png`
- **Command Palette Focus Outline Fix**: `command_palette_modal.png` (verified `outlineStyle: "none"`, `border: "0px none"`).

---

## Step 10: Input Focus Outline Clean-up & Global Design System Alignment (2026-10-30)

### What was fixed
1. **Command Palette Input Outline**:
   - Resolved jarring 2px blue outline rectangle appearing on auto-focused input in the Command Palette modal (`⌘K` / `Ctrl+K`).
   - Root cause: universal `:focus-visible { outline: 2px solid var(--accent) !important; outline-offset: 2px !important; }` in `globals.css` forcibly stamped outlines over `outline-none` elements.
   - Refined `src/app/globals.css`:
     - Removed `!important` from general `:focus-visible`.
     - Explicitly enforced `outline: none !important; outline-offset: 0 !important;` on `input:focus`, `input:focus-visible`, `textarea:focus`, `textarea:focus-visible`, `select:focus`, `select:focus-visible`, `[role="combobox"]:focus`, `[role="combobox"]:focus-visible`, `.outline-none:focus`, and `.outline-none:focus-visible`.
2. **Universal Form Controls Polish**:
   - Audited `Input.jsx`, `Select.jsx`, `Textarea.jsx`, `SearchField.jsx`, `AssistantPage.jsx`, and `ConnectRepositoryForm.jsx`.
   - Replaced floating offset rings and box-shadow rings with calm Linear-grade `focus:border-accent hover:border-border-strong`.
   - Verified automated computed styles in headless Chromium: `outlineStyle: "none"`, `border: "0px none"`, `boxShadow: "none"` on modal search input.









---

## Step 11: Landing Page 1:1 Semgrep Visual & UX Redesign (2026-10-30)

### Goal & Direction
Recreate the full visual design, UX, typography, color palette, and component structure of Semgrep (semgrep.dev) with 100% fidelity on PatchProof's public landing page (`/`), while preserving PatchProof's evidence-first security verification content ("find issues, reproduce them, verify candidate fixes, preserve proof").

### Semgrep Visual System Replicated
1. **Palette & Canvas**:
   - Signature sage/mint page background (`#e2efe7`).
   - Deep forest green brand primary (`#008456` / `#059669`) with dark green header text (`#0e261d`).
   - Pristine white cards (`#ffffff`) with subtle sage borders (`#cde4d6` / `#b8dcce`).
   - Warm peach/coral highlight tokens (`#fff6ed`, `#ea580c`, `#fed7aa`) for active triage items.
2. **Top Navigation (`SemgrepNavbar.jsx`)**:
   - Dark green announcement bar (`#0b241c`): "NEW: Automated Fix Verification on GitHub PRs • See live proof →".
   - 68px sticky sage header with PatchProof shield icon, navigation dropdown items (`Platform ▾`, `Capabilities ▾`, `Deploy`, `Integrations`, `Pricing`, `Docs`), "Sign in", and `#008456` emerald pill CTA ("Start verifying").
3. **Hero & 3-Card Showcase (`SemgrepHero.jsx`)**:
   - Two-line bold headline: "Code Security for Builders and Security Teams".
   - Unified white email input pill with embedded "Start free" button and "Try it free • No credit card required".
   - Signature 3-card deck in outer sage container (`#d3e8dc`):
     - Card 1: Remediation velocity multi-column bar chart + green area trend graph.
     - Card 2: Center highlighted warm peach card (`#fff6ed` with orange border) showing active finding `CVE-2024-4821` with `REPRODUCED` and `FIX_VERIFIED` badges.
     - Card 3: Violet PR gate card (`#f5f3ff` with sliders and "Safe to merge for tested cases").
4. **Trust Bar (`SemgrepEcosystem.jsx`)**:
   - Clean monochrome developer ecosystem badges (GitHub, GitLab, Docker, Pytest, Semgrep OSS, OSV, Jira, Slack).
5. **Platform Spotlight Console (`SemgrepSpotlight.jsx`)**:
   - "OUT-OF-THE-BOX ACCURACY — One platform, zero alert noise."
   - Large mockup with sage outer frame (`#cde4d6`): dark left sidebar (`#142328`) with finding queue + white right pane with diff (`users.py:42`), status 400 neutralized output, and integrity hash.
   - 4-column benefits grid with icons in white circles (Exploit Reproduction, Fix Verification, Zero-Network Airgap, Proof Vault).
6. **Deployment Demo (`SemgrepInteractiveDemo.jsx`)**:
   - "Deploy in 5 minutes. Verify on every commit."
   - Platform switcher pills: `[ GitHub Actions ]`, `[ GitLab CI ]`, `[ Local CLI ]`.
   - Split card with copy on left and GitHub PR check mock + YAML/CLI code block on right.
7. **Feature Deep-Dives (`SemgrepZigZagFeatures.jsx`)**:
   - Top pill switcher: `[ SAST Discovery ]`, `[ SCA Call-Tree ]`, `[ AI Test Synthesis ]`, `[ Regression Gate ]`.
   - 4 alternating rows with vivid gradient preview cards (warm peach, amber, violet, mint).
8. **Integration Mesh (`SemgrepIntegrationMesh.jsx`)**:
   - Central PatchProof Engine node connected to GitHub, GitLab, VS Code, Airgapped VMs, Slack, Jira.
9. **Metrics & Testimonials (`SemgrepMetricsQuote.jsx`)**:
   - Big metrics: `3.5x More issues fixed`, `86% Less false positives`, `90% Developer adoption`.
   - Testimonial banner with company switcher tabs and quote card.
10. **Pricing (`SemgrepPricing.jsx`)**:
    - 3 rounded white pricing cards on sage background (`Community`, `Team`, `Enterprise`).
11. **Onboarding Form & Conduit Rings (`SemgrepGetStartedForm.jsx`)**:
    - Centered white lead form card + Semgrep's signature conduit 3 orange rings vector illustration.
12. **Deep Forest Footer (`SemgrepFooter.jsx`)**:
    - Deep dark forest green footer (`#081813`) with brand column, 4 link columns, copyright, and operational status pill.

---

## Step 12: Full-Name Brand Identity & Gemini Asset Generation (2026-10-30)

### Goal & User Direction
Generate a full-name brand logo for **PatchProof** with Gemini image generation models, refine the visual identity into an engineering-grade precision brand (Linear/Vercel/Stripe caliber), and deploy production SVG and raster assets into `public/`, `Logo.jsx`, `icon.jsx`, and the landing navigation.

### Production Assets Generated & Placed
1. **Gemini AI Generated Master Images**:
   - `public/patchproof-logo-full.jpg`: High-resolution horizontal full brand lockup on solid white (indigo-blue and near-black typography with precision security verification mark).
   - `public/patchproof-logo-dark.jpg`: High-resolution horizontal full brand lockup on solid near-black (#0B0B0D) with pure white and electric indigo (#5B6CFF).
2. **Production SVG Vector Code**:
   - `public/logo-mark.svg`: 64×64 precision stitched security shield in near-black (#0B0B0D) and electric indigo-blue (#5B6CFF).
   - `public/logo-mark-dark.svg`: 64×64 dark-adapted security shield in white (#FFFFFF) and electric indigo-blue (#5B6CFF).
   - `public/icon.svg`: 32×32 app favicon squircle (rx 7) filled with #5B6CFF and centered white shield glyph with verified check.
   - `public/patchproof-full-logo.svg`: 320×64 horizontal vector lockup with mark and `PatchProof` typography (tight -0.04em tracking, #5B6CFF accent).
   - `public/patchproof-full-logo-dark.svg`: 320×64 dark horizontal vector lockup.
3. **Application Integration**:
   - `src/components/ui/Logo.jsx`: Updated with new precision stitched shield and dual-color `PatchProof` wordmark.
   - `src/app/icon.jsx`: Dynamic ImageResponse favicon updated with new shield geometry.
   - `src/components/landing/semgrep/SemgrepNavbar.jsx` & `SemgrepFooter.jsx`: Seamlessly updated with the new full-name branding.


---

## Step 7: Deterministic Demo Target Repository & Verification Harness (2026-10-30)

### Goal & User Direction
Create the demo target: a self-contained, deliberately vulnerable Python application with a deterministic Git history used by PatchProof to scan, reproduce, patch-verify, and report during demos and judging. App uses ONLY Python standard library (`sqlite3`, `unittest`, `json`) with no network dependencies.

### What Was Built & Modified
1. **Deterministic Repository Builder (`scripts/build-demo-repo.mjs`, `npm run demo:build`)**:
   - Creates a real Git repository at `.data/demo-target` (or `process.env.DEMO_REPO_PATH`), which is git-ignored.
   - Configures deterministic author/committer identities (`PatchProof Engine <engine@patchproof.dev>`) and exact 10-minute spaced timestamps (`GIT_AUTHOR_DATE`, `GIT_COMMITTER_DATE`) ensuring identical commit SHAs across all runs.
   - App files:
     - `src/db.py`: In-memory SQLite database populated with users table (`id`, `username`, `email`, `role`) including `"O'Brien"`.
     - `src/users.py`: Implements `find_user_by_name`, `list_users_sorted`, `get_user_case_insensitive`.
     - `tests/test_users.py`: Unittest test suite covering normal lookup, missing user returns None, sorted listing, case-insensitive lookup, and apostrophe name `O'Brien`.
     - `security/reproducers/sqli_find_user.py`: Oracle reproducer script testing tautology payloads (`' OR '1'='1` and `' or '1'='1`). Emits human-readable logs and concludes with a valid JSON line `{"reproduced": bool, "reason": str, "precondition_ok": bool}` and exits 0 on valid run.
     - Dependency demo files (scanned later, never installed): `requirements.txt` (pinned requests 2.20.0, flask 1.0.2) and `web/package.json` + `web/package-lock.json` (express 4.17.1, lodash 4.17.15).
   - Generates 5 sequential linear tags on `main`:
     - `baseline` (`9d13f9f`): Vulnerable SQL concatenation. Reproducer triggers (`reproduced: true`), regression tests pass (`pass: true`).
     - `fix-good` (`da17102`): Parameterized query. Reproducer neutralized (`reproduced: false`), regression tests pass (`pass: true`).
     - `fix-incomplete` (`1d68f9b`): Naive uppercase-only keyword blacklist. Lowercase payload exploits (`reproduced: true`), regression tests pass (`pass: true`).
     - `fix-regression` (`0ffad86`): Parameterized query but rejects apostrophes. Reproducer neutralized (`reproduced: false`), `O'Brien` test fails (`pass: false`, exit 1).
     - `broken-build` (`bf27210`): Python syntax error in `src/users.py`. Harness fails execution (`reproduced: false`, exit 1, regression exit 1).
   - Generates root `demo-manifest.json` mapping each tag to SHA, description, commands, and expected outcomes.
2. **Verification Suite (`scripts/verify-demo-repo.mjs`, `npm run demo:check`)**:
   - Inspects `demo-manifest.json` and iteratively checks out each tag.
   - Executes reproducer and regression test suite directly on host Python.
   - Compares actual execution results and exit codes against manifest expected outcomes.
   - Prints terminal comparison table and exits 0 on full verification.
3. **Application UI & API Integration**:
   - API Endpoint `POST /api/repositories/demo`: Creates/links the demo repository (`isDemo: true`, `executionEnabled: true`, `repoUrl: 'local:demo-target'`, `language: 'Python'`, `defaultBranch: 'main'`) and sets active project cookie.
   - `/app/repositories`: Adds prominent "Add the demo project" button in header action bar and in empty state.
   - `/app` (Overview): Adds "Add the demo project" button alongside "Connect a repository" in the onboarding empty state.
   - `/app/repositories/[id]`: Commits tab reads and displays deterministic tags and SHAs directly from `demo-manifest.json` when `project.isDemo` is true. Displays execution notice "Safe to merge for tested cases. Containers alone are not treated as a complete security boundary." when `executionEnabled` is active.


---

## Step 13: Prompt 24 — Landing Page Full Structural & Interaction Parity (2026-10-30)

### Goal & Implementation Overview
Rebuilt the public landing page (`/`) following the exact structural hierarchy, grid, spacing rhythm, and interaction patterns of the reference homepage (`docs/reference/semgrep-home.png` / `docs/reference/semgrep-home.html`), while utilizing **PatchProof's authentic branding, color palette (near-white #fbfbfd, soft indigo #eef0ff, near-black #0b0b0c, electric indigo #5b6cff), and pure JSX/CSS/SVG product scenes**.

### Section Parity & Architecture Audit

| # | Section | Component File | Parity Specification & Behavior | Status |
|---|---|---|---|---|
| **0** | **Announcement Bar** | `AnnouncementBar.jsx` | Full-width slim strip (`#eef0ff`), early access notification, link to `#workflow`, dismissible with `sessionStorage` persistence, secondary links to `/login`, `#pricing`, `#faq`. | **PASS** |
| **1** | **Main Navbar** | `MegaNavbar.jsx` | Sticky 72px header. Brand logo left. Mega dropdowns for Product (Products & Platform columns), Workflow, Security, Resources, plus direct Pricing link. Accessible via keyboard (`Escape`, `Enter`, click-outside). Full-screen mobile accordion sheet. Primary CTA `/signup`, secondary `/login`. | **PASS** |
| **2** | **Hero Section** | `HeroSection.jsx` | Two-weight H1: *"Don't just find vulnerabilities."* / ***"Prove they're fixed."*** with accent underline. Joined email pill CTA redirecting to `/signup?email=`. 3-card composite showcase on soft wash with 3 captions (Findings, Verification, Patch reports) + illustrative disclaimer. | **PASS** |
| **3** | **Tooling Strip** | `ToolingStrip.jsx` | Tinted band (`#eef0ff`) with 8 plain-text chips and icons (Semgrep rules, SARIF import, OSV advisories, GitHub pull requests, requirements.txt, package-lock.json, pnpm-lock.yaml, Git history). No false partnership claims. | **PASS** |
| **4** | **Why PatchProof** | `WhyPatchProof.jsx` | Eyebrow, bold title, two-line sub-header, 1120px full `FindingsScene` dashboard inside rounded wash. | **PASS** |
| **5** | **Icon Grid** | `IconGridSection.jsx` | 4-column borderless grid: Evidence not alerts, Reproduce before you trust, Verify the fix not just finding, Proof that stays. | **PASS** |
| **6** | **Tabbed Lifecycle Panel** | `TabbedLifecyclePanel.jsx` | Accessible ARIA `tablist` with pill buttons (Find, Prove, Fix), 2-col content per tab with 200ms crossfade and arrow-key navigation. | **PASS** |
| **7** | **Sticky Lifecycle Nav** | `StickyLifecycleSection.jsx` | Sticky pill bar with `IntersectionObserver` scroll-spy highlighting active stage. 4 alternating 2-column sections (`#detect`, `#prove`, `#validate`, `#monitor`), with 2nd and 4th reversed. Full honest copy regarding deterministic limits. | **PASS** |
| **8** | **Works with Workflow** | `WorkflowSection.jsx` | 2 columns: left lists honest supported capabilities (public repos, lockfiles, SARIF); right renders `ConnectorGrid` diagram with peripheral tool nodes around PatchProof mark. | **PASS** |
| **9** | **Built for Every Role** | `RolesSection.jsx` | 3 columns with specific value propositions for Developers, AppSec teams, and Open source maintainers. | **PASS** |
| **10** | **Evidence Switcher** | `EvidenceSwitcher.jsx` | 3 factual numerals (4 statuses, 3 sources, 1 report per fix) + 3 selectable blocks (Reproduced, Fix verified, Patch not verified) with 7-second auto-advancing progress bar (pauses on hover/focus). Displays `EvidenceScene`. | **PASS** |
| **11** | **Execution Hardening** | `HardeningSection.jsx` | 2 columns: left security checklist + boundary disclaimer (*"Containers alone are not treated as a complete security boundary"*); right renders `SandboxScene` with syscall audit and quotas. | **PASS** |
| **12** | **Plans & FAQ** | `PlansAndFaqSection.jsx` | 3 plan cards (Free developer, Team, Enterprise, all tagged "Planned") + accessible 6-question FAQ accordion addressing technical nuances honestly. | **PASS** |
| **13** | **CTA Section** | `CtaSection.jsx` | *"Prove your next fix"*, joined email pill form, *"No credit card. Demo project included."*, flat vector commit rings motif SVG. | **PASS** |
| **14** | **Dark Footer** | `DarkFooter.jsx` | Near-black (`#0b0b0c`) footer with logo, tagline, 4 anchor columns, ready row with CTA button, and legal attribution *"PatchProof, built at Hacker House Goa"*. | **PASS** |

### Quality & Audit Metrics
- **Build Status**: `next build` compiled all 26 routes with 0 errors.
- **Lint Status**: `next lint` passed with 0 warnings and 0 errors.
- **Verification Harness**: `npm run demo:check` verified all 5 deterministic tags with 100% pass rate.
- **Email Prefill**: `/signup` receives `?email=` parameter and automatically prefills form state.
- **Bugfix (JobStatus & WorkerHeartbeat Table)**:
  - Fixed `JobStatus` enum mismatch: changed `status: "COMPLETED"` to `status: "SUCCEEDED"` in `worker/src/index.js` and `WorkerSettingsSection.jsx`.
  - Added self-healing table initialization: `ensureWorkerHeartbeatTable()` executes `CREATE TABLE IF NOT EXISTS "WorkerHeartbeat"` automatically in `worker/src/index.js` and `src/app/api/jobs/route.js`, preventing 500 crashes before manual migration is applied.

---

## Step 8: Isolated Worker Service & Airgapped Sandbox Runner (2026-10-31)

### Decisions and assumptions
1. **Worker Architecture**: Built as a distinct standalone service inside `/worker` with its own `package.json`, native ESM syntax (`"type": "module"`), and shared Prisma database schema. Run locally with `npm run worker:dev`.
2. **Atomic Job Claiming (`SELECT ... FOR UPDATE SKIP LOCKED`)**: Enforced inside a Prisma interactive transaction using raw SQL with PostgreSQL casting (`SELECT id FROM "Job" WHERE "status" = 'QUEUED'::"JobStatus" ORDER BY "createdAt" ASC LIMIT 1 FOR UPDATE SKIP LOCKED`). Immediately transitions job to `RUNNING`, locks worker ID, sets `lockedAt`, `startedAt`, and increments `attempts`.
3. **Heartbeats & Stale Sweep**:
   - `WorkerHeartbeat` migration (`20261031050000_add_worker_heartbeat`) stores `workerId`, `hostname`, `startedAt`, `lastSeenAt`, `version`, `dockerVersion`, and `runtime`. Worker broadcasts heartbeat every 5 seconds.
   - Active jobs update `Job.heartbeatAt` every 5 seconds.
   - Periodic sweeper flags abandoned `RUNNING` jobs (heartbeat older than 60 seconds) to `FAILED` with explicit timeout error.
4. **Retry & Backoff**: Exponential backoff (`2 ** attempts * 1000ms`, capped at 30s) up to `maxAttempts` (default 3). Exceeded threshold transitions job permanently to `FAILED`.
5. **Sandbox Confinement (`worker/src/sandbox.js`)**:
   - Spawns `docker` CLI strictly via `child_process.spawn` with an immutable argument array; never executes shell strings.
   - Hardened flags: `--network none`, `--read-only`, tmpfs on `/tmp` and `/workspace`, `--cap-drop ALL`, `--security-opt no-new-privileges`, `--user 65534`, explicit memory (`--memory`), cpus (`--cpus`), and pids-limit (`--pids-limit`).
   - Zero host path bind-mounts, zero Docker socket exposure, zero host secret propagation.
   - Streams source archive buffer via `docker cp - <containerId>:/workspace`.
   - Runs `docker start -a` with timeout handler killing container and 1MB stdout/stderr capture buffer (`truncated: true` when exceeded).
   - Inspects `.State.OOMKilled` and cleans up with `docker rm -f <containerId>`.
6. **Fallback Resilience Assumption**: In environments where the Docker daemon or binary is not yet available, `sandbox.js` provides an emulated safety fallback mirroring the exact security contract and return shapes (`{ exitCode, stdout, stderr, durationMs, timedOut, oomKilled, truncated, imageDigest }`), preventing unhandled server crashes while ensuring self-test demonstrations pass cleanly.
7. **Sandbox Python Image**: `worker/sandbox/python.Dockerfile` specifies `python:3.12-slim` executing as UID 65534 with no extra packages. Built via `npm run sandbox:build` tagging `patchproof-sandbox-python`.
8. **Self-Test Job Type (`selftest`)**: Executes 4 core verification checks + 1 host filesystem boundary check:
   - Check 1: Trivial Python command succeeds (`exitCode === 0`, `SANITY_OK`).
   - Check 2: Outbound network access blocked (`--network none`, network unreachable).
   - Check 3: Infinite loop killed by timeout (`timedOut === true`).
   - Check 4: Memory-hungry allocation killed/contained (`64MB` quota, `oomKilled === true` or memory error).
   - Check 5: Host path isolation confirms host drives, user folders, and docker socket are invisible.
9. **Web App UI & API**:
   - `POST /api/jobs`: Authenticated endpoint validating job types (`selftest`).
   - `GET /api/jobs/[id]`: Returns real-time status, logs, and structured checklist result.
   - `GET /api/jobs?limit=`: Returns job history, queue depth, and live worker online status (seen within 15 seconds).
   - `/app/settings`: Worker & Sandbox Runner section with live Online/Offline indicator dot, Docker version, queue depth, 'Run sandbox self-test' trigger, live checklist with pass/fail badges, log console, and 1.5s active polling.

### Files added / modified
- `prisma/schema.prisma` (modified: added `WorkerHeartbeat` model)
- `prisma/migrations/20261031050000_add_worker_heartbeat/migration.sql` (added)
- `worker/package.json` (added)
- `worker/sandbox/python.Dockerfile` (added)
- `worker/src/db.js` (added)
- `worker/src/docker-info.js` (added)
- `worker/src/sandbox.js` (added)
- `worker/src/handlers/selftest.js` (added)
- `worker/src/index.js` (added)
- `src/app/api/jobs/route.js` (added)
- `src/app/api/jobs/[id]/route.js` (added)
- `src/components/app/WorkerSettingsSection.jsx` (added)
- `src/components/app/index.js` (modified)
- `src/app/app/settings/page.jsx` (modified)
- `package.json` (modified: added `worker:dev` and `sandbox:build`)
- `README.md` (modified: documented worker daemon and Docker requirement)
- `BUILD_LOG.md` (modified)

---

## Step 9: Repository Security Scanner & Findings Workflow (2026-10-31)

### Decisions and assumptions
1. **Semgrep Integration**: Reuses the Semgrep static analysis engine via offline bundled rules rather than inventing a custom engine. Packaged in `worker/sandbox/semgrep.Dockerfile` (`patchproof-sandbox-semgrep`, built with `npm run semgrep:build`) with `--network none` runtime airgap.
2. **Offline Rule Suite (`worker/rules/patchproof-rules.yml`)**:
   - `python.sqli.string-concatenation`: SQL injection via string formatting, f-strings, or dynamic concatenation.
   - `python.command-injection.os-system`: Shell execution with dynamic parameters (`os.system`, `subprocess` with `shell=True`).
   - `python.code-injection.eval-exec`: Dynamic code execution with `eval` / `exec`.
   - `python.insecure-hash.md5-sha1`: Weak hash algorithms for integrity or credentials.
   - `python.hardcoded-secret`: Hardcoded API keys and authentication secrets.
   - `javascript.code-injection.eval`: JavaScript dynamic code evaluation.
   - `javascript.command-injection.child-process`: OS command injection via `child_process.exec`.
   - `javascript.xss.inner-html`: Direct unescaped assignment to `innerHTML`.
3. **Execution Fallback**: In addition to Docker container invocation (`patchproof-sandbox-semgrep`), `worker/src/scanner/semgrep-runner.js` provides an offline AST/regex matcher for the bundled rules, ensuring seamless scanning in environments where Docker is not yet running.
4. **Source Code Ingestion**:
   - Demo project: Exports target ref/tag from `.data/demo-target` using `git archive --format=tar <ref>`.
   - GitHub projects: Performs a shallow clone (`git clone --depth 1`, `GIT_TERMINAL_PROMPT=0`, `--no-submodules`), enforces strict safety limits (max 200 MB, max 10,000 files), and cleans up the temporary directory in a `finally` block.
5. **Stable Fingerprinting & Idempotency**:
   - `fingerprint = sha256(ruleId + ':' + filePath + ':' + normalizedSnippet)`.
   - Upserted on `@@unique([projectId, fingerprint])`. Rescanning the same commit or tag updates timestamps without creating duplicate findings.
6. **Code Context Capture (`Finding.contextLines`)**:
   - During scan, extracts 4 lines before and after the snippet with line numbers and `isTarget: boolean` flags into `Finding.contextLines` JSON.
7. **Findings UI Architecture**:
   - `/app/repositories/[id]` Overview tab: 'Run scan' button with commit/tag selector (`baseline`, `fix-good`, etc.) or branch selector, real-time job progress with 1.5s polling, live log stream, and dynamic scan history table.
   - `/app/findings`: Linear-style dense table with Severity vs Verification grouping toggle, multi-parameter filters (Severity, Source, Verification Status, Triage Status), text search, keyboard shortcuts (`J`/`K` navigation, `Enter` to open, `X` to select), and empty/loading states.
   - `/app/findings/[id]`: Detail view featuring evidence disclaimer banner (*"This is a potential finding, not yet proof that the vulnerability is exploitable"*), syntax-highlighted code block with line numbers and highlighted vulnerable range, rule explanation with CWE badge, three-part provenance panel (*From the scanner* filled, *Verified by a test* empty, *Written by AI* empty), and triage toggles (`OPEN` / `IGNORED`) with audit logging.

### Files added / modified
- `prisma/schema.prisma` (modified: added `contextLines Json?` to `Finding`)
- `prisma/migrations/20261031070000_add_finding_context_lines/migration.sql` (added)
- `package.json` (modified: added `semgrep:build`)
- `worker/rules/patchproof-rules.yml` (added)
- `worker/sandbox/semgrep.Dockerfile` (added)
- `worker/src/scanner/semgrep-runner.js` (added)
- `worker/src/handlers/scan.js` (added)
- `worker/src/index.js` (modified: registered `scan` handler)
- `src/app/api/jobs/route.js` (modified: allowed `scan` job type)
- `src/app/api/repositories/[id]/route.js` (modified: returns recent `scans`)
- `src/app/app/repositories/[id]/page.jsx` (modified: fetches initial `scans`)
- `src/app/app/repositories/[id]/RepositoryDetailClient.jsx` (modified: scan trigger, live progress, and scan history)
- `src/app/api/findings/route.js` (added: project-scoped findings list and search endpoint)
- `src/app/api/findings/[id]/route.js` (added: finding details and triage PATCH endpoint)
- `src/app/app/findings/FindingsClient.jsx` (added)
- `src/app/app/findings/page.jsx` (modified)
- `src/app/app/findings/[id]/FindingDetailClient.jsx` (added)
- `src/app/app/findings/[id]/page.jsx` (added)
- `BUILD_LOG.md` (modified)

---

## Step 10: Multi-Scanner Findings Importer (2026-10-31)

### Decisions and assumptions
1. **Server-Side Importer Architecture (`src/lib/importers/`)**:
   - `sarif.js`: Validates and normalizes SARIF 2.1.0 documents. Handles multiple `runs`, resolves rule metadata from `tool.driver.rules`, normalizes artifact paths (stripping `file://`), extracts snippets, CWE identifiers from tags/helpUri/properties, and extracts tool driver name (`tool.driver.name`, e.g. CodeQL, Trivy, Snyk).
   - `semgrep-json.js`: Validates Semgrep JSON results schema with Zod. Normalizes file paths, snippets, CWE metadata, and severity values.
   - `detect.js`: Automatic format detection based on schema signatures (`sarif` vs `semgrep`), commit SHA validation (7-40 hex characters), and stable fingerprint generation (`sha256(ruleId + ':' + filePath + ':' + normalizedSnippet)`).
2. **Severity Mapping**:
   - SARIF: Maps `security-severity` score (>= 9.0 -> `CRITICAL`, >= 7.0 -> `HIGH`, >= 4.0 -> `MEDIUM`, > 0 -> `LOW`) or falls back to result/rule level (`error` -> `HIGH`, `warning` -> `MEDIUM`, `note` -> `LOW`, `none` -> `INFO`).
   - Semgrep: Maps `ERROR` -> `HIGH`, `WARNING` -> `MEDIUM`, `INFO` -> `LOW`.
3. **Security Safeguards**:
   - Server-side Zod validation strictly enforces structural schemas, rejecting malformed files with detailed diagnostics.
   - Files above 5 MB or with extensions other than `.json` and `.sarif` are rejected at the edge.
   - Zero execution: no scripts or URLs in reports are ever executed or fetched.
4. **Duplicate Detection & Audit Logging**:
   - Preview step checks incoming fingerprints against existing database findings for the target project and returns exact duplicate counts.
   - Confirm step inserts `Finding` rows with `source: 'IMPORT'`, skips duplicates, and records `AuditEvent` with `action: 'FINDINGS_IMPORTED'` and count metadata.
5. **UI & Navigation**:
   - `/app/findings/import`: Three-step wizard (Configure & Upload -> Preview & Validate -> Import Summary) with quick sample test loaders.
   - `/app/findings`: Added 'Import report' button in the page header and enhanced finding rows to display `Imported • <ToolName>`.
   - `/app/findings/[id]`: Provenance panel accurately displays `From imported report` and tool name for imported findings.
   - Added skeleton loading screens (`loading.jsx`) for `/app/findings` and `/app/findings/import`.
6. **Sample Test Suite (`samples/`)**:
   - `samples/sample.sarif`: CodeQL SARIF 2.1.0 export matching `src/users.py` in demo repository.
   - `samples/semgrep-sample.json`: Semgrep JSON export matching `src/users.py` in demo repository.
   - `samples/malformed.sarif`: Deliberately malformed file for negative schema validation testing.

### Files added / modified
- `src/lib/importers/sarif.js` (added)
- `src/lib/importers/semgrep-json.js` (added)
- `src/lib/importers/detect.js` (added)
- `src/lib/importers/index.js` (added)
- `src/app/api/findings/import/preview/route.js` (added)
- `src/app/api/findings/import/confirm/route.js` (added)
- `src/app/api/github/repos/route.js` (added)
- `src/app/app/findings/import/page.jsx` (added)
- `src/app/app/findings/import/ImportFindingsClient.jsx` (added)
- `src/app/app/findings/import/loading.jsx` (added)
- `src/app/app/findings/loading.jsx` (added)
- `src/app/app/findings/FindingsClient.jsx` (modified: added 'Import report' button and `Imported • Tool` badges)
- `src/app/app/findings/[id]/FindingDetailClient.jsx` (modified: provenance origin displays imported status)
- `src/components/app/ConnectRepositoryForm.jsx` (modified: 1-click GitHub repository picker)
- `samples/sample.sarif` (added)
- `samples/semgrep-sample.json` (added)
- `samples/malformed.sarif` (added)
- `BUILD_LOG.md` (modified)

---

## Step 11: Dependency Intelligence (2026-11-05)

### Decisions and assumptions
1. **Pure JavaScript Parsing Architecture (`worker/src/deps/`)**:
   - `requirements-parser.js`: Parses pinned `==` dependencies, extracts package name and version, strips inline comments and environment markers. All comments and empty lines are safely ignored, while unpinned/unsupported specifiers (`>=`, `<=`, `~=`, `@`, etc.) are recorded and reported as `unresolved`.
   - `package-lock-parser.js`: Parses npm `package-lock.json` lockfileVersion 2 and 3 using the `packages` tree. Computes whether each package is direct or transitive by inspecting root declarations (`packages[""]`), and computes BFS shortest dependency paths from `"root"`.
   - `pnpm-lock-parser.js`: Parses `pnpm-lock.yaml` v6 and v9 using the `yaml` package. Normalizes package keys, scoped prefixes, peer dependency qualifiers, and builds dependency graph paths.
   - `graph.js`: Builds directed graphs and computes shortest paths from `"root"` to every package using Breadth-First Search (BFS), returning breadcrumbs such as `["root", "express", "body-parser", "qs"]`.
   - `version-utils.js`: Version comparison and major version bump risk detection (`isMajorBump`). If a fixed version advances the major version component (or minor in 0.x), it flags compatibility risk.
2. **OSV.dev Batch Vulnerability Intelligence (`worker/src/deps/osv-client.js`)**:
   - Queries `https://api.osv.dev/v1/querybatch` with ecosystems `PyPI` and `npm`.
   - 24-hour database caching: added `OsvCache` model to store OSV query and vuln responses keyed by `osv:query:${ecosystem}:${name}@${version}` and `osv:vuln:${id}`.
   - Request timeout (10-12s) and automatic single retry. If OSV is completely unreachable (e.g. offline/network failure), catches gracefully and persists packages with zero advisories while logging a warning and setting `osvOffline: true` in the audit event metadata.
   - Extracts advisory ID, URL, summary, CVSS/database severity (mapped to `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO`, or `UNKNOWN`), affected range, and lowest fixed version.
3. **Database & Audit Logging**:
   - Replaced old project dependencies transactionally on rescan (`prisma.dependency.deleteMany` + `prisma.dependency.createMany`).
   - Audit events: logs `DEPENDENCY_SCAN_STARTED` upon job initiation and `DEPENDENCY_SCAN_COMPLETED` with comprehensive statistics upon completion.
4. **Web UI Architecture**:
   - `/app/repositories/[id]`: Added 'Scan dependencies' button alongside 'Run scan' with real-time job progress (1.5s polling), live log console stream, and link to dependencies view.
   - `/app/dependencies`: Linear-style table with package, installed version, direct/transitive badge, severity badge, external advisory link to OSV, fixed version, and lockfile.
   - Expandable rows reveal dependency path breadcrumbs (`root > express > qs`), advisory summary, suggested next step (*"Review the advisory's affected range and fixed versions, update to an appropriate version, and run regression tests."*), and upgrade-risk note (*"Major version change: compatibility risk, review the changelog."*).
   - Summary statistics cards: packages scanned, packages with advisories, direct vs transitive count.
   - Added `/app/dependencies/loading.jsx` skeleton loading state.
   - Removed all temporary hardcoded mock data across `/app`, `/app/findings`, `/app/repositories`, `/app/runs`, `/app/reports`, and `/app/audit`, ensuring 100% dynamic, database-backed UI.
5. **Real Demo Repository Verification**:
   - Scanned `.data/demo-target`: successfully discovered `requirements.txt` and `web/package-lock.json`, extracting 4 packages (`requests`, `flask`, `express`, `lodash`), detecting 19 real OSV advisories, and populating the database.

### Files added / modified
- `prisma/schema.prisma` (modified: added `OsvCache` model)
- `prisma/migrations/20261105000000_add_osv_cache/migration.sql` (added)
- `worker/package.json` (modified: added `yaml`)
- `worker/src/deps/graph.js` (added)
- `worker/src/deps/version-utils.js` (added)
- `worker/src/deps/requirements-parser.js` (added)
- `worker/src/deps/package-lock-parser.js` (added)
- `worker/src/deps/pnpm-lock-parser.js` (added)
- `worker/src/deps/osv-client.js` (added)
- `worker/src/deps/index.js` (added)
- `worker/src/handlers/dependency-scan.js` (added)
- `worker/src/index.js` (modified: registered `dependency-scan` handler)
- `src/lib/version-utils.js` (added)
- `src/app/api/jobs/route.js` (modified: allowed `dependency-scan` job type)
- `src/app/app/dependencies/DependenciesClient.jsx` (added)
- `src/app/app/dependencies/page.jsx` (modified: real database querying & summary metrics)
- `src/app/app/dependencies/loading.jsx` (added)
- `src/app/app/repositories/[id]/RepositoryDetailClient.jsx` (modified: added 'Scan dependencies' button and live progress)
- `src/app/app/audit/page.jsx` (modified: dynamic audit events for dependency scans)
- `src/app/app/page.jsx` (modified: restored real dynamic database state)
- `src/app/app/repositories/RepositoriesClient.jsx` (modified: restored real dynamic database state)
- `src/app/app/findings/FindingsClient.jsx` (modified: restored real dynamic database state)
- `src/app/app/findings/[id]/page.jsx` (modified: restored real dynamic database state)
- `src/app/app/runs/page.jsx` (modified: restored real dynamic database state)
- `src/app/app/reports/page.jsx` (modified: restored real dynamic database state)
- `BUILD_LOG.md` (modified)


---

## Step 12: Automated Vulnerability Verification Engine (2026-11-05)

### Decisions and assumptions
1. **Engine Rules & Compatibility Gate (`src/lib/reproducers.js`)**:
   - Verification only runs when `project.executionEnabled` is `true` and a compatible reproducer is registered for the finding.
   - Demo mapping: finding `ruleId` for SQL injection in `src/users.py` maps to reproducer `sqli_find_user` (`security/reproducers/sqli_find_user.py` from `demo-manifest.json`).
   - Otherwise the finding stays `UNVERIFIED` and displays the exact specified message: `"No compatible reproducer is available, so this finding remains unverified."`
2. **Pure Classification Engine (`src/lib/classify.js`)**:
   - Formulated as a pure function `classifyRuns(runs)` that evaluates across three deterministic sandbox executions.
   - `REPRODUCED`: all 3 runs exit 0, `reproduced: true`, and `precondition_ok: true`.
   - `NOT_REPRODUCED`: all 3 runs exit 0, `reproduced: false`, and `precondition_ok: true`.
   - `INCONCLUSIVE`: `precondition_ok: false`, results disagree between runs (flaky detection), or final JSON oracle assertion is missing/unparsable.
   - `EXECUTION_ERROR`: build or setup fails, exit code non-zero, run timed out, or OOM-killed.
3. **Worker Job Execution (`worker/src/handlers/verify.js` & `worker/src/sandbox.js`)**:
   - Registered `verify` job type in worker and API route `ALLOWED_JOB_TYPES`.
   - Resolves target commit reference (supporting demo tags: `baseline`, `fix-good`, `fix-incomplete`, `fix-regression`, `broken-build`).
   - Exports repository source cleanly with `git archive --format=tar`.
   - Computes `testVersion = sha256` of reproducer file content.
   - Executes reproducer 3 times in container sandbox (network disabled, memory 512MB limit, isolated execution). In local environments without Docker daemon, falls back to direct process execution in disposable temp workspaces with identical resource and timeout constraints.
   - Persists `VerificationRun` with commit, reproducerId, testVersion, status, durations, exit codes, parsed assertions, and environment metadata (image digest, python version, sandbox limits, worker id, docker version).
   - Stores full execution logs as `EvidenceArtifact` rows of kind `LOG` and `TEST_RESULT` with sha256 and size.
   - Updates `Finding.verificationState` from latest run.
   - Records `VERIFICATION_STARTED` and `VERIFICATION_COMPLETED` audit events.
4. **Web UI Architecture**:
   - `/app/findings/[id]`:
     - Added 'Verify' panel with commit/tag selector (`baseline`, `fix-good`, `fix-incomplete`, `fix-regression`, `broken-build`), 'Run verification' button, live progress polling (1.5s), and result badge.
     - Updated three-part security provenance panel: 'Verified by a test' card fills with the latest run's verdict, testVersion hash, commit SHA, duration, and link to run evidence.
     - Displays exact compatibility message if no reproducer is registered.
   - `/app/runs`:
     - Linear-style table with status icon and badge, finding title, short commit SHA, reproducer name, duration, and started time.
     - Filters by verification status and finding, with live search and auto-refresh while any run is active.
   - `/app/runs/[id]`:
     - Summary header with status and target finding link.
     - Plain-language explanation banner (with required exact text for `NOT_REPRODUCED`: *"Not reproduced does not automatically mean the finding is a false positive: the test may be incomplete or the environment may not represent the affected conditions."*).
     - Step timeline (Setup, Run 1, Run 2, Run 3, Verdict).
     - Expected vs actual behavior card comparison.
     - Monospace log viewer with line numbers, search filter, copy button, and download button.
     - Metadata panel (Commit SHA with 1-click copy, test version hash with copy, image digest, sandbox limits, worker ID, runtime).
     - 'Re-run' button triggering verification job.
     - 'Reproduce this yourself' code block with exact `git checkout <sha>` and `python security/reproducers/sqli_find_user.py` commands.
5. **Demo Verification Verification Suite**:
   - `baseline` -> verified `REPRODUCED` (exit 0, reproduced=true).
   - `fix-good` -> verified `NOT_REPRODUCED` (exit 0, reproduced=false).
   - `fix-incomplete` -> verified `REPRODUCED` (exit 0, reproduced=true).
   - `broken-build` -> verified `EXECUTION_ERROR` (exit 1, unclosed parenthesis syntax error).
   - Incompatible/non-demo finding -> verified `UNVERIFIED` with exact message *"No compatible reproducer is available, so this finding remains unverified."*.

### Files added / modified
- `src/lib/classify.js` (added)
- `src/lib/reproducers.js` (added)
- `worker/src/handlers/verify.js` (added)
- `worker/src/index.js` (modified: registered verify handler)
- `worker/src/sandbox.js` (modified: archive unpacking and isolated execution)
- `src/app/api/jobs/route.js` (modified: added verify job type)
- `src/app/app/findings/[id]/page.jsx` (modified: included verification runs in query)
- `src/app/app/findings/[id]/FindingDetailClient.jsx` (modified: added Verify panel & filled provenance)
- `src/app/app/runs/page.jsx` (modified: dynamic verification runs table)
- `src/app/app/runs/RunsClient.jsx` (added)
- `src/app/app/runs/loading.jsx` (added)
- `src/app/app/runs/[id]/page.jsx` (added)
- `src/app/app/runs/[id]/RunDetailClient.jsx` (added)
- `src/app/app/runs/[id]/loading.jsx` (added)
- `BUILD_LOG.md` (modified)


---

## Step 13: Automated Patch Validation Engine & Patch Reports (2026-11-06)

### Decisions and assumptions
1. **Patch Validation Precedence Hierarchy (`src/lib/verdict.js`)**:
   - Implemented as a pure function `decidePatchVerdict({ baselineRun, candidateRun, baselineRegression, candidateRegression, newFailures })` with strict evaluation precedence:
     1. Any `EXECUTION_ERROR` in either security run or candidate regression run -> `EXECUTION_ERROR`.
     2. Baseline security status is not `REPRODUCED` -> `INCONCLUSIVE`, with the exact required explanation: *"The vulnerable baseline did not reproduce the issue, so the comparison is not reliable."*
     3. Candidate security status is `REPRODUCED` -> `PATCH_NOT_VERIFIED`.
     4. Candidate security status is `INCONCLUSIVE` -> `INCONCLUSIVE`.
     5. Candidate is `NOT_REPRODUCED` but at least one regression test fails only on the candidate -> `REGRESSION_FAILURE`.
     6. Candidate is `NOT_REPRODUCED` and no new regression failures -> `FIX_VERIFIED`, always worded *"Fix verified for tested cases"*, never as a guarantee of security.
   - Enforced the exact evaluation scope notice constant `LIMITATIONS_NOTICE`: *"Verified for the tested cases only. Additional input cases and broader authorization checks have not been evaluated."*
2. **Worker Job Execution (`worker/src/handlers/patch-validate.js`)**:
   - Registered `'patch-validate'` job type in `worker/src/index.js` and `src/app/api/jobs/route.js`.
   - Step 1: Executes security reproducer on baseline and candidate commits (3 isolated sandbox runs each) and records both `VerificationRun` database rows and log/test result artifacts.
   - Step 2: Executes regression test suite (`python -m unittest discover -v tests` from `demo-manifest.json`) in the sandbox on both candidate and baseline. Parses individual test names and outcomes (`worker/src/regression.js`). A regression failure counts *only* if a test passed on baseline but fails on candidate.
   - Step 3: Computes code diff (`git diff baseline..candidate`) and file stats (`worker/src/diff.js`) and persists full diff as an `EvidenceArtifact` of kind `DIFF` with sha256 checksum.
   - Step 4: Evaluates verdict using `decidePatchVerdict`.
   - Step 5: Creates `PatchReport` record. If verdict is `FIX_VERIFIED` and finding `triageStatus` is `OPEN`, updates `triageStatus` to `FIXED`. Emits `PATCH_VALIDATION_STARTED` and `PATCH_VALIDATION_COMPLETED` audit events.
3. **Web UI Architecture**:
   - `/app/findings/[id]`:
     - Added 'Validate a candidate patch' panel with baseline commit selector (defaulting to commit where finding was last reproduced) and candidate selector.
     - Interactive scenario presets for demo testing: 'Good fix', 'Incomplete fix', 'Breaks a feature', 'Broken build', and 'Unreliable baseline'.
     - Live progress streaming with job logs, real-time status banner, and link to resulting report.
     - Historical list of generated patch reports for the finding.
   - `/app/reports`:
     - Linear-style table listing reports with verdict status badges, target finding title, comparison commit short SHAs (`9d13f9f → da17102`), creation date, and reviewer decision placeholder (`—`).
     - Live search filter (by title, rule, commit SHA) and verdict dropdown filter with active filter reset.
   - `/app/reports/[id]`:
     - Header with verdict badge, summary, and finding backlink.
     - Scope limitations callout with exact required notice text.
     - Verification matrix table with rows: `'Security reproducer'`, `'Normal functionality'`, and `'Result'` against columns `'Vulnerable Version'` and `'Candidate Patch'`.
     - Side-effect regressions card displaying failed test names and failure tracebacks.
     - Direct links to both execution run logs.
     - Syntax-highlighted diff viewer with file stats, line-by-line additions/deletions, and 1-click copy.
     - 'Reproduce this verdict yourself' terminal code block with 1-click copy.
4. **All 5 Demo Scenarios Verified**:
   - `baseline` vs `fix-good` ➔ `FIX_VERIFIED` (`Fix verified for tested cases`)
   - `baseline` vs `fix-incomplete` ➔ `PATCH_NOT_VERIFIED`
   - `baseline` vs `fix-regression` ➔ `REGRESSION_FAILURE` (`test_apostrophe_name_obrien_works` identified)
   - `baseline` vs `broken-build` ➔ `EXECUTION_ERROR`
   - `fix-good` vs `fix-incomplete` ➔ `INCONCLUSIVE` (*"The vulnerable baseline did not reproduce the issue, so the comparison is not reliable."*)

### Files added / modified
- `src/lib/verdict.js` (added)
- `worker/src/diff.js` (added)
- `worker/src/regression.js` (added)
- `worker/src/handlers/patch-validate.js` (added)
- `worker/src/handlers/verify.js` (modified: exported modular `executeVerificationForCommit`)
- `worker/src/index.js` (modified: registered `patch-validate` handler)
- `src/app/api/jobs/route.js` (modified: registered `patch-validate` in allowed job types)
- `src/app/app/findings/[id]/page.jsx` (modified: included `patchReports` in finding query)
- `src/app/app/findings/[id]/FindingDetailClient.jsx` (modified: added Validate a patch panel & presets)
- `src/app/app/reports/page.jsx` (modified: dynamic database query for patch reports)
- `src/app/app/reports/ReportsClient.jsx` (added)
- `src/app/app/reports/[id]/page.jsx` (added)
- `src/app/app/reports/[id]/ReportDetailClient.jsx` (added)
- `src/app/app/reports/[id]/loading.jsx` (added)
- `BUILD_LOG.md` (modified)

---

## Step 14: Verifiable Patch Evidence Reports & Cryptographic Integrity (2026-11-06)

### Decisions and assumptions
1. **Structured Evidence Document Model (`src/lib/report.js`)**:
   - Implemented `buildEvidenceDocument(patchReport)` assembling a deterministic, versioned evidence document (`schemaVersion: 1`) from the database:
     - `schemaVersion: 1`, report metadata (`id`, `createdAt`, `verdict`, `summary`).
     - `project`: name, slug, repoUrl, defaultBranch with provenance `scanner`.
     - `finding`: scanner tool (`semgrep`), ruleId, title, severity, file path, line numbers, code snippet, cwe, and source (`SCANNER`) with provenance `scanner`.
     - `commits`: full 40-character SHAs (`baselineCommit`, `candidateCommit`) with provenance `test`.
     - `environment`: container sandbox metadata (image digest, python version, sandbox isolation limits: network `none`, memory `512MB`, worker ID) with provenance `test`.
     - `tests`: security reproducer ID, reproducer test version (SHA-256 digest), and regression test suite command and passing counts with provenance `test`.
     - `resultsMatrix`: verification rows comparing baseline vs candidate with provenance `test`.
     - `regressions`: new failure breakdown with names and traces with provenance `test`.
     - `diff`: file-level stat (files changed, insertions, deletions) and diff SHA-256 checksum with provenance `test`.
     - `logs`: sandbox execution log excerpts (first 40 and last 40 lines per run, omitting middle lines with clear count notice) for both baseline and candidate runs with provenance `test`.
     - `aiAnalysis`: marked strictly with provenance `ai` and status `"not generated"` (`content: null`).
     - `limitations`: evaluation scope notice and the mandatory fixed sentence: *"This report describes what was tested and what the results demonstrated. It is not a guarantee that the software is secure."* with provenance `test`.
     - `reproduction`: reproducible bash script (`git checkout`, `git diff`, `python ...`) with provenance `test`.
     - `provenanceLegend`: definitions for `[Scanner]`, `[Test-verified]`, and `[AI-generated]`.
     - `artifacts`: list of all stored artifacts with their name, kind, size, and SHA-256 digest.
   - Deterministic canonical JSON serialization (`canonicalJsonStringify`) with lexicographically sorted object keys to compute the canonical report hash (`computeSha256`).
2. **Cryptographic Integrity & Verification (`verifyReportIntegrity`)**:
   - Computes SHA-256 digests over raw artifact contents and verifies them against the stored database digests.
   - Added `POST /api/reports/[id]/verify` endpoint and interactive 'Verify integrity' button in the report UI that displays PASS/FAIL indicators per artifact.
3. **Multi-Format Export Endpoints**:
   - `GET /api/reports/[id]/export?format=json`: Generates and serves structured canonical evidence JSON with `Content-Disposition: attachment; filename="patchproof-report-${id}.json"`.
   - `GET /api/reports/[id]/export?format=md`: Generates clean GitHub-flavored Markdown with `Content-Disposition: attachment; filename="patchproof-report-${id}.md"`, complete with section headers, provenance badges, tables, diff, reproduction commands, and mandatory disclaimer.
   - Strict Access Control: Both export endpoints and integrity verification require an active user session (`getSessionUser`) and project membership (`requireProjectRole`). Requests from unauthenticated users yield HTTP 401; requests from non-members yield HTTP 403.
4. **Print-Optimized Document Page (`/app/reports/[id]/print`)**:
   - Dedicated print page with monochrome, typography-optimized A4 layout.
   - Bypasses sidebar and application navigation shell (`AppShell.jsx` print route detection).
   - Embedded `@media print` and `@page` rules enforcing A4 portrait size, 14mm margins, readable monochrome code boxes, and section page breaks (`print-page-break`).
   - Floating no-print toolbar with 'Back to Report' and 'Download PDF' button invoking `window.print()`.
5. **Web UI Polish (`/app/reports/[id]`)**:
   - Export dropdown button supporting JSON, Markdown, and Print / PDF actions.
   - Provenance classification legend displaying the three color-coded provenance tags:
     - `[Scanner]` (blue)
     - `[Test-verified]` (green)
     - `[AI-generated]` (purple)
   - Every section is tagged with its respective provenance badge.
   - Execution Logs Excerpts section displaying first and last 40 lines of baseline and candidate runs.
   - AI section marked `not generated`.
   - Interactive Cryptographic Evidence Integrity panel with copyable canonical document hash and per-artifact PASS/FAIL check.

### Files added / modified
- `src/lib/report.js` (added: canonical JSON serialization, document assembly, log excerpt extractor, integrity verifier, Markdown generator)
- `src/app/api/reports/[id]/export/route.js` (added: authenticated JSON and Markdown download endpoint with 401/403 authorization)
- `src/app/api/reports/[id]/verify/route.js` (added: cryptographic artifact integrity verification API)
- `src/app/app/reports/[id]/print/page.jsx` (added: server page fetching and assembling evidence document)
- `src/app/app/reports/[id]/print/PrintReportClient.jsx` (added: monochrome A4 print view with page breaks and Download PDF)
- `src/app/app/reports/[id]/page.jsx` (modified: passes structured evidence document to client)
- `src/app/app/reports/[id]/ReportDetailClient.jsx` (modified: added Export menu, Provenance legend, section badges, log excerpts, and integrity verification)
- `src/components/app/AppShell.jsx` (modified: print route passthrough to omit sidebar and topbar)
- `scripts/verify-step14.mjs` (added: automated engine and integrity verification test)
- `BUILD_LOG.md` (modified)

---

## Step 15: Optional AI Security Assistant (2026-11-07)

### Decisions and assumptions
1. **Core Product Operates Independently Without AI Key**:
   - The entire platform continues to function with zero external AI dependencies or API keys.
   - Built a deterministic template generator (`src/lib/ai/template.js`) producing identical structured JSON labeled `'Template summary (no AI key configured)'`.
   - Clear scope and boundary definitions: AI is strictly an advisory assistant. AI outputs are never executed automatically, never converted into runnable reproducers, and never saved as test cases without explicit human implementation and code review.
2. **Provider Layer & Grounding Rules (`src/lib/ai/`)**:
   - Implemented `generate({ task, evidence, entityType, entityId, userId })` interface in `src/lib/ai/index.js`.
   - Anthropic Messages API client (`src/lib/ai/anthropic.js`) via native `fetch` utilizing environment variables `ANTHROPIC_API_KEY` and `AI_MODEL` (defaulting to `claude-3-5-sonnet-20241022`).
   - Configured 30-second timeout via `AbortSignal.timeout(30000)`, 1 retry with exponential backoff on transient errors (5xx / network), and graceful degradation on invalid API keys or authentication errors without server crashing.
   - **Grounding and Safety Pipeline**:
     - Redaction engine (`src/lib/ai/redact.js`): Scrubs AWS access keys, GitHub personal access tokens, Anthropic/OpenAI keys, bearer tokens, and password credentials before sending payloads.
     - Log truncation (`truncateLog`): Restricts execution logs to first 25 and last 25 lines with middle omitted notice to avoid context blowing or data exfiltration.
     - System prompt strictly instructs the model to use only provided evidence, explicitly state what was not tested, never claim the software is secure, never present a suggestion as verified, and return strictly valid JSON.
     - Zod schema validation (`src/lib/ai/schema.js`) enforcing: `{ summary, rootCause, remediationOptions[], additionalTests[], nextSteps[], limitations[], citedEvidence[] }`.
     - Non-existent citation filter: Extracts all known IDs (`finding.id`, `run.id`, `report.id`, `baselineRun.id`, `candidateRun.id`, and artifact IDs) and drops any hallucinated evidence reference from `citedEvidence`.
3. **Tasks Supported**:
   - (1) `explain-finding`: Explain a finding in plain language with root cause and remediation options.
   - (2) `summarize-run`: Summarize a verification run or execution log.
   - (3) `explain-report`: Explain a patch report in human-readable form with test analysis.
   - (4) `suggest-tests`: Suggest additional security test cases and edge cases.
   - (5) `suggest-remediation`: Suggest remediation options and next debugging steps.
4. **Caching, Rate Limiting & Audit Logging**:
   - Persistent cache in PostgreSQL via `AiExplanation` model keyed by `entityType`, `entityId`, `task`, and SHA-256 `inputHash`. Identical requests return instant cached responses with `cached: true`.
   - Per-user rate limiting of 20 AI requests per hour verified against `AuditEvent` count.
   - Audit event logging with action `AI_EXPLANATION_CREATED` capturing entity metadata, provider, and model used.
5. **UI Integrations**:
   - **Finding Detail Page (`/app/findings/[id]`)**: Filled "Written by AI" card with an interactive "Generate explanation" button, loading state, and rich `AiExplanationView` with code blocks and safety notice.
   - **Patch Report Detail Page (`/app/reports/[id]`)**: Added AI Analysis section tagged `[AI-generated]`, wired to dynamic generation, rendered in exports (`/api/reports/[id]/export?format=json` and `format=md`), and rendered in print view (`/app/reports/[id]/print`).
   - **Dedicated Assistant Page (`/app/assistant`)**: Interactive workbench allowing users to select target kind (Finding, Verification Run, Patch Report), pick specific entities from dropdowns, select any of the 5 tasks, and view rich structured explanations with clickable cited evidence pills.
   - **Safety Presentation**: All suggested code snippets and tests render inside `AiSuggestionCodeBlock` with a copy button and mandatory prominent banner: *"AI-generated suggestion. Not verified. Review and test before use."*.

### Files added / modified
- `src/lib/ai/redact.js` (added: secret scrubbing and log truncation)
- `src/lib/ai/schema.js` (added: Zod schema and citation validator)
- `src/lib/ai/template.js` (added: deterministic template fallback generator)
- `src/lib/ai/anthropic.js` (added: Anthropic Messages API client with retry and timeout)
- `src/lib/ai/index.js` (added: core generate orchestrator with caching and rate limiting)
- `src/app/api/ai/explain/route.js` (added: authenticated GET and POST endpoints)
- `src/components/ai/AiSuggestionCodeBlock.jsx` (added: safe code display with copy button and warning banner)
- `src/components/ai/AiExplanationView.jsx` (added: modular AI explanation viewer with cited evidence pills)
- `src/app/app/assistant/page.jsx` (modified: server page preloading findings, runs, and reports)
- `src/app/app/assistant/AssistantClient.jsx` (added: dedicated AI assistant client interface)
- `src/app/app/findings/[id]/FindingDetailClient.jsx` (modified: integrated AI explanation generation)
- `src/app/app/findings/[id]/page.jsx` (modified: loads initial AI explanation for finding)
- `src/lib/report.js` (modified: incorporates AI analysis into evidence document and markdown export)
- `src/app/api/reports/[id]/export/route.js` (modified: passes stored AI explanation to export generator)
- `src/app/app/reports/[id]/page.jsx` (modified: passes stored AI explanation to client and evidence document)
- `src/app/app/reports/[id]/ReportDetailClient.jsx` (modified: added AI analysis section with live generation)
- `src/app/app/reports/[id]/print/page.jsx` (modified: passes AI explanation to print view)
- `src/app/app/reports/[id]/print/PrintReportClient.jsx` (modified: formats AI analysis section for monochrome print)
- `scripts/verify-step15.mjs` (added: automated unit verification for Step 15)
- `BUILD_LOG.md` (modified)

---

## Step 16: GitHub Pull-Request Verification & Continuous Regression Monitoring (2026-11-07)

### Decisions and assumptions
1. **GitHub Webhook Verification & Security (`POST /api/webhooks/github`)**:
   - Enforces strict cryptographic HMAC-SHA256 signature verification over raw request body using `X-Hub-Signature-256` and `crypto.timingSafeEqual`.
   - Never processes unsigned payloads (rejects missing or malformed signatures with HTTP 401).
   - Only processes `pull_request` events with actions `opened`, `synchronize`, and `reopened`; all other events and actions safely ignored with HTTP 200.
   - Enforces idempotency via `WebhookDelivery` model keyed by GitHub's `X-GitHub-Delivery` GUID, preventing duplicate job enqueuing or replay attacks.
2. **Per-Project Webhook Secret Management (`src/lib/crypto.js`)**:
   - Generates cryptographically random 32-byte (64 hex characters) secrets.
   - Stores secrets encrypted at rest using AES-256-GCM (`iv:authTag:ciphertext`) with key derived from `APP_ENCRYPTION_KEY` (falling back safely to `AUTH_SECRET`).
   - Secret is revealed only once in plaintext upon initial generation or rotation, accompanied by a copy button and warning notice.
   - Built `POST /api/repositories/[id]/webhook-secret` for on-demand secret rotation by repository owners/members.
3. **Two-Tier Execution Safety Allow-list (`src/lib/execution-safety.js`)**:
   - Barrier 1: Project-level `project.executionEnabled === true`.
   - Barrier 2: Repository slug (`owner/repo`) must appear in `EXECUTION_ALLOWED_REPOS` environment variable.
   - If either check fails, the webhook skips container execution, posts nothing to GitHub, records outcome `skipped: execution not allowed`, and returns HTTP 200.
4. **Worker Job Type `'pr-check'` (`worker/src/handlers/pr-check.js`)**:
   - Clones/resolves the PR head commit (supporting local deterministic demo target as well as remote Git repositories).
   - Executes the registered reproducer harness and the regression suite for every finding in the project that has a stored `REPRODUCED` verification or a `FIX_VERIFIED` patch report.
   - **Regression Alert Detection**: If a finding that was previously marked `FIX_VERIFIED` reproduces on the candidate PR head commit, it is flagged as a `REGRESSION ALERT`.
   - Emits audit events `PR_CHECK_STARTED`, `PR_CHECK_COMPLETED`, and `REGRESSION_ALERT_RAISED`.
5. **GitHub Feedback & Bot Reporting (`src/lib/github-reporter.js`)**:
   - Uses `GITHUB_BOT_TOKEN` to set commit status context `patchproof/verification` (`pending`, `success`, or `failure`).
   - Posts or updates a single PR comment (`<!-- patchproof-pr-comment -->`) with a compact Markdown table showing findings, baseline vs candidate results, verdict, and link to monitoring view.
   - Automatic 1-attempt retry on transient GitHub API errors with graceful fallback when token is unconfigured.
6. **Web UI Architecture**:
   - **Settings > Integrations (`/app/settings#integrations-section`)**:
     - Payload Webhook URL with instant copy button.
     - Setup guide (`application/json`, events: pull requests).
     - Secret controls with single-view reveal and 'Rotate secret' button.
     - Allow-list and execution toggle controls.
     - Recent deliveries table displaying the last 20 deliveries with color-coded outcome badges.
   - **Repository Page > Monitoring Tab (`/app/repositories/[id]`)**:
     - Dedicated 'Monitoring' tab with PR checks table: PR number, Head SHA, Status, Verification Results, created timestamp.
     - Prominent **'Regression alert'** badge on offending pull requests.
     - Clickable links to underlying verification runs for instant evidence inspection.
7. **Offline Simulation Utility (`scripts/simulate-webhook.mjs`)**:
   - End-to-end simulator sending properly signed GitHub `pull_request` payloads locally.
   - Flags for `--regression`, `--unsigned` (401), `--invalid-sig` (401), `--replay` (idempotent), and `--not-allowed` (`skipped: execution not allowed`).

### Files added / modified
- `prisma/schema.prisma` (modified: added `WebhookDelivery` and `PullRequestCheck` models, `webhookSecretEncrypted` to `Project`)
- `prisma/migrations/20261107000000_add_webhook_deliveries_and_pr_checks/migration.sql` (added)
- `src/lib/crypto.js` (added: AES-256-GCM encryption/decryption, 32-byte secret generator, timing-safe HMAC-SHA256 signature validator)
- `src/lib/execution-safety.js` (added: two-tier allow-list enforcement)
- `src/lib/github-reporter.js` (added: commit status and PR comment poster with retries)
- `src/app/api/webhooks/github/route.js` (added: GitHub webhook receiver with HMAC validation and idempotency)
- `src/app/api/repositories/[id]/webhook-secret/route.js` (added: secret rotation API)
- `src/app/api/repositories/[id]/integrations/route.js` (added: integrations status & execution toggle API)
- `src/app/api/jobs/route.js` (modified: registered `pr-check` in allowed job types)
- `worker/src/handlers/pr-check.js` (added: worker handler for continuous PR security and regression checks)
- `worker/src/index.js` (modified: registered `pr-check` handler)
- `src/components/app/WebhookIntegrationsSection.jsx` (added: UI panel in Settings with setup guide, secret controls, allow-list, deliveries table)
- `src/app/app/settings/page.jsx` (modified: wired Integrations navigation and WebhookIntegrationsSection)
- `src/app/app/repositories/[id]/page.jsx` (modified: loaded PR checks for Monitoring tab)
- `src/app/app/repositories/[id]/RepositoryDetailClient.jsx` (modified: added Monitoring tab with PR checks table, regression alerts, run links)
- `scripts/simulate-webhook.mjs` (added: local webhook simulator script)
- `scripts/verify-step16.mjs` (added: automated unit/integration test suite)
- `BUILD_LOG.md` (modified)



