# PatchProof

Evidence-first security verification platform. PatchProof discovers vulnerabilities, reproduces them with controlled tests, validates that a patch really fixes them without breaking normal behaviour, and monitors future pull requests for regressions.

## Project Structure

```
├── BUILD_LOG.md           # Continuous build log & architectural decisions
├── docker-compose.yml     # Local PostgreSQL 16 container service
├── prisma/
│   ├── schema.prisma      # Prisma schema (models, relations, enums, indexes)
│   └── seed.js            # Initial seed script (admin demo user)
├── src/
│   ├── app/               # Next.js App Router (pages & API routes)
│   ├── components/
│   │   ├── ui/            # Reusable UI design system primitives
│   │   ├── landing/       # Marketing and landing page components
│   │   └── app/           # Security verification application components
│   └── lib/               # Shared utilities, db client singleton, and constants
```

## Getting Started

### 1. Environment Configuration

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure `DATABASE_URL` and `DIRECT_URL` are configured:
```env
DATABASE_URL="postgresql://patchproof:patchproof_secret@localhost:5432/patchproof?schema=public"
DIRECT_URL="postgresql://patchproof:patchproof_secret@localhost:5432/patchproof?schema=public"
```

For hosted databases like Neon or Supabase:
- `DATABASE_URL`: Connection pooled string (e.g., PgBouncer on port 6543)
- `DIRECT_URL`: Direct unpooled connection (port 5432) for schema migrations

### 2. Start Local PostgreSQL Service

Launch the PostgreSQL 16 container:
```bash
docker compose up -d
```

### 3. Run Database Migrations & Seed

Apply the Prisma migrations to create all tables and enums:
```bash
npm run db:migrate
```

Seed the initial demo administrator user (no fake findings or mock reports):
```bash
npm run db:seed
```

To visually inspect database tables in a web UI:
```bash
npm run db:studio
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Start the Sandbox Worker Service

PatchProof uses an isolated background worker daemon to claim and execute verification jobs inside airgapped Docker sandbox containers.

**Prerequisites:**
- **Docker** must be installed and running (e.g., Docker Desktop or Docker Engine).

**Build the sandbox execution image:**
```bash
npm run sandbox:build
```
This builds `patchproof-sandbox-python` using `worker/sandbox/python.Dockerfile` (Python 3.12, unprivileged user `65534`).

**Run the worker service:**
```bash
npm run worker:dev
```
The worker will:
- Poll the `Job` queue every 2 seconds using atomic `SELECT ... FOR UPDATE SKIP LOCKED`.
- Update worker heartbeats every 5 seconds (`WorkerHeartbeat`).
- Enforce strict confinement (`--network none`, `--read-only`, tmpfs, `--cap-drop ALL`, memory and CPU limits).
- Provide execution telemetry and self-tests visible on `/app/settings`.

## API Health Check

Check application and database status at:
- [http://localhost:3000/api/health](http://localhost:3000/api/health)
Returns `{ status: "ok", app: "patchproof", version: "0.1.0", time: "...", db: "up" | "down" }`

## Design System & Dev Kitchen Sink

Inspect and test all UI primitives, badges, and tokens at:
- [http://localhost:3000/dev/ui](http://localhost:3000/dev/ui) (available only in development mode)
