# ArchiFlow AI — Enterprise Migration Plan (Step-by-Step)

> Target: **Production-grade, enterprise schema** with **zero schema drift**, **no mocking**, and **repeatable deployments**.

This plan assumes:
- PostgreSQL is the system of record
- You already have an enterprise schema file: `database/schema.sql`
- Current environment is local, but must be upgrade-ready for production

---

## 0) Non-Negotiables (Rules of Engagement)
1. **Schema is versioned** (migrations live in git).
2. **No manual DB edits** in pgAdmin/psql after this plan starts.
3. Every schema change is a new migration file.
4. CI must run migrations on a clean DB and pass smoke tests.

---

## 1) Choose Migration Framework
**Decision:** Use **Prisma Migrate** (recommended for TS/Node projects).

Why Prisma:
- Fast setup
- Strong developer workflow
- Built-in migration history table
- Easy CI integration

> If you prefer Knex/Flyway later, you can migrate strategy, but pick one now and commit.

---

## 2) Prep (Safety + Clean Baseline)

### 2.1 Backup Current Local DB (Mandatory)
If you have any data you care about:

```bash
pg_dump -h localhost -U <db_user> -d <db_name> > backup_before_migrations.sql
```

### 2.2 Create a Clean Database (Recommended)
Create a fresh DB for the enterprise baseline:

```bash
createdb -h localhost -U <db_user> archiflow_enterprise
```

> If you must reuse an existing DB, you’ll need to drop and recreate tables. Clean DB is faster and safer.

---

## 3) Apply the Enterprise Schema Once (Bootstrap)
Apply your existing enterprise schema SQL into the clean DB:

```bash
psql -h localhost -U <db_user> -d archiflow_enterprise -f database/schema.sql
```

✅ After this, the DB reflects your enterprise schema *exactly*.

---

## 4) Initialize Prisma (Migrations + Schema Tracking)
From your project root:

```bash
npm install -D prisma
npm install @prisma/client
npx prisma init
```

Edit `.env` to point to your enterprise DB:

```env
DATABASE_URL="postgresql://<db_user>:<db_pass>@localhost:5432/archiflow_enterprise?schema=public"
```

---

## 5) Generate `schema.prisma` from the Real DB (Introspection)
Because the enterprise schema already exists in DB (from step 3), introspect it:

```bash
npx prisma db pull
```

Generate Prisma client:

```bash
npx prisma generate
```

---

## 6) Create the “Baseline Migration” (Critical Step)
You need Prisma to “adopt” this schema as the baseline in git so future changes are tracked.

### Option A (Recommended): Prisma Baseline via `migrate diff`
Create a baseline migration from empty → current schema:

```bash
mkdir -p prisma/migrations/0001_enterprise_baseline
npx prisma migrate diff   --from-empty   --to-schema-datamodel prisma/schema.prisma   --script > prisma/migrations/0001_enterprise_baseline/migration.sql
```

Now mark it as applied (because DB already has it):

```bash
npx prisma migrate resolve --applied 0001_enterprise_baseline
```

✅ Result:
- Migration file exists in git
- Prisma migration history is consistent
- DB is considered “up-to-date” without reapplying

---

## 7) Add a “Schema Drift Gate” (Fail Fast on Startup)
This prevents incidents like `42703 undefined_column` (schema mismatch).

### 7.1 Require migrations to be current
Use these conventions:
- **Production** uses `migrate deploy`
- **Local dev** uses `migrate dev`

Recommended startup command (production-like):

```bash
npx prisma migrate deploy
node server.js
```

Local dev:

```bash
npx prisma migrate dev
```

> Optional (strongly recommended): On startup, run `npx prisma migrate status` and fail hard if pending migrations exist.

---

## 8) Standardize DB Enums + App Enums (Stop Type Drift)
### 8.1 Single source of truth
Define these enums once and reuse in FE + BE:
- `diagram_type` allowed values
- `projects.status` allowed values
- any other constrained fields

**Action:**
- Create a shared `src/shared/enums.ts` (or a shared package)
- Frontend only sends values from that enum
- Backend validates and rejects anything else

✅ Prevents “works in UI but fails in DB” issues.

---

## 9) Fix Code to Match Enterprise Constraints (Common Breakpoints)
Enterprise schema enforces NOT NULL and foreign keys.

Audit these:
- `diagrams.title NOT NULL` → backend must always provide `title`
- `projects.status NOT NULL` → set DB default or always insert a value
- FK constraints (project/workspace membership must exist)

**Action:**
- Identify every `INSERT INTO` in code
- Confirm all NOT NULL columns are provided OR have defaults
- Confirm all FK dependencies exist before inserts

---

## 10) CI/CD Pipeline Requirements (Production-Ready)
Add these steps to CI:

1. Spin up Postgres
2. `npm ci`
3. `npx prisma migrate deploy`
4. Run smoke tests:
   - Create workspace
   - Add member
   - Create project
   - Create diagram
   - Create diagram version
   - Create ai_job
   - Create audit_event

If any migration fails → block merge.

---

## 11) How to Do Future Schema Changes (The Only Allowed Way)
### 11.1 Update schema via Prisma model changes
1. Modify `prisma/schema.prisma`
2. Create migration:

```bash
npx prisma migrate dev --name add_ai_job_steps
```

3. Commit:
- `prisma/migrations/*`
- `prisma/schema.prisma`

### 11.2 Deploy to Production

```bash
npx prisma migrate deploy
```

---

## 12) Verification Checklist (You Must Pass This)
### 12.1 Prisma status

```bash
npx prisma migrate status
```

Expected: **Database schema is up to date**

### 12.2 Basic CRUD smoke (manual or automated)
- Create Workspace ✅
- Add Workspace Member ✅
- Create Project ✅
- Create Diagram ✅
- Create Diagram Version ✅
- Create ai_job ✅
- Create audit_event ✅

### 12.3 Drift test (proves the gate works)
- Manually alter a column in DB (test only)
- Restart backend
- Backend must fail fast with a clear drift message ✅

---

## 13) Strict Production Mode (No Mocking)
Because you want **no mock mode**, enforce this rule:

If no active LLM connection exists for workspace:

```json
{
  "ok": false,
  "error": {
    "code": "LLM_NOT_CONFIGURED",
    "message": "No active LLM connection found for this workspace.",
    "details": { "workspaceId": "..." }
  }
}
```

No fallback diagrams. No fake outputs.

---

## 14) Deliverables (What Antigravity Must Commit)
✅ `prisma/schema.prisma` (introspected enterprise model)  
✅ `prisma/migrations/0001_enterprise_baseline/migration.sql`  
✅ CI pipeline running `prisma migrate deploy`  
✅ Startup drift gate enabled  
✅ Shared enums FE/BE  
✅ All inserts updated to satisfy NOT NULL + FK constraints  
✅ Mock mode removed with strict LLM policy  

---

# End
If your team follows this, incidents like:
- `42703 undefined_column`
- `insert violates not null constraint`
- `invalid input value for enum`
…become **build-time failures**, not user-time failures.
