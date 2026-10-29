# PatchProof

Evidence-first security verification platform. PatchProof discovers vulnerabilities, reproduces them with controlled tests, validates that a patch really fixes them without breaking normal behaviour, and monitors future pull requests for regressions.

## Project Structure

```
├── BUILD_LOG.md           # Continuous build log & architectural decisions
├── src/
│   ├── app/               # Next.js App Router (pages & API routes)
│   ├── components/
│   │   ├── ui/            # Reusable UI design system primitives
│   │   ├── landing/       # Marketing and landing page components
│   │   └── app/           # Security verification application components
│   └── lib/               # Shared utilities, helpers, and constants
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Design System & Dev Kitchen Sink

Inspect and test all UI primitives, badges, and tokens at:
- [http://localhost:3000/dev/ui](http://localhost:3000/dev/ui) (available only in development mode)
