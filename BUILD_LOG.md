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
- Landing page on `/` is a minimal placeholder until step 2.
- The `/dev/ui` route is restricted to non-production environments.
