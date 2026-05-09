# Vercel Deployment Setup

This runbook documents the hosting and CI/CD configuration for `react-data-dashboard` across production, staging, and PR previews.

## Architecture overview

Deployments are gated through GitHub Actions — Vercel's automatic Git integration is **disconnected**. No code reaches Vercel without passing CI first.

| Trigger | Workflow | Outcome |
|---|---|---|
| PR to `main` or `staging` | `.github/workflows/ci.yml` | Lint, typecheck, unit tests, build, e2e → preview deploy |
| Push to `staging` | `.github/workflows/deploy-staging.yml` | Full validation + staging deploy |
| Push to `main` | `.github/workflows/deploy-production.yml` | Full validation + production deploy |

## Required GitHub secrets

Add these in **GitHub → repo Settings → Secrets → Actions**:

| Secret | Where to find it |
|---|---|
| `VERCEL_TOKEN` | vercel.com → Account Settings → Tokens |
| `VERCEL_ORG_ID` | Run `vercel link` locally → `.vercel/project.json` → `orgId` |
| `VERCEL_PROJECT_ID` | Run `vercel link` locally → `.vercel/project.json` → `projectId` |
| `CHROMATIC_PROJECT_TOKEN` | Chromatic project settings (optional — skipped if unset) |

## RDDB-71: Neon + Vercel environment documentation

This section captures the environment setup completed for RDDB-71 without exposing secrets:

- **Neon**
  - One Neon Postgres database is provisioned for **production**.
  - One Neon Postgres database is provisioned for **staging**.
- **Vercel**
  - `DATABASE_URL` (target: **Production**) points to the production Neon database.
  - `DATABASE_URL` (target: **Preview**, branch filter: `staging`) points to the staging Neon database.
  - `DATABASE_URL` (target: **Preview**, default/no branch filter) is configured as the fallback for non-staging preview branches.

### Acceptance criteria evidence checklist

Use this checklist when closing the ticket:

- [ ] Vercel project contains a **Production** `DATABASE_URL` entry.
- [ ] Vercel project contains a **Preview** `DATABASE_URL` entry filtered to the `staging` branch.
- [ ] Production deployment from `main` connects successfully to production Neon.
- [ ] Staging deployment from `staging` connects successfully to staging Neon.
- [ ] Documentation review is complete.

## 1. Connect the repository

> **Note:** Vercel's automatic Git integration is disconnected. Deployments are triggered exclusively by GitHub Actions using the Vercel CLI. Do not re-enable auto-deploy in Vercel Project Settings → Git.

To link the CLI locally (needed to obtain `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`):

```bash
npm install -g vercel
vercel login
vercel link   # select the decodedcreative scope and existing project
```

The values are written to `.vercel/project.json` (gitignored). Copy `orgId` → `VERCEL_ORG_ID` and `projectId` → `VERCEL_PROJECT_ID` into GitHub secrets.

## 2. Configure production deployment

1. In **Project Settings → Git**, set **Production Branch** to `main`.
2. In **Project Settings → Domains**, add the production domain (if applicable).
3. In **Project Settings → Environment Variables**, add:
   - `DATABASE_URL` for **Production** (production database connection string).

## 3. Configure staging deployment

Vercel staging is handled as a branch-targeted preview deployment:

1. Create or use a long-lived `staging` branch.
2. In **Project Settings → Environment Variables**, add `DATABASE_URL` with target:
   - **Preview**
   - **Branch filter**: `staging`
3. (Optional) Assign a stable staging domain to the latest `staging` deployment (for example `staging.<domain>`).

## 4. Configure PR preview deployments

1. For any preview branch except `staging`, add a fallback preview `DATABASE_URL`:
   - target: **Preview**
   - no branch filter (or a wildcard filter matching non-staging previews).
2. Open a PR — CI will run validation and post the preview URL as a PR comment once all checks pass.

## 5. Branch-to-environment mapping

- `main` -> **Production** deployment + production `DATABASE_URL`
- `staging` -> **Preview** deployment + branch-filtered staging `DATABASE_URL`
- `feature/*` / PR branches -> **Preview** deployment + default preview `DATABASE_URL`

## 6. Post-setup validation checklist

- Push to `main` and confirm a production deployment succeeds in the Actions tab.
- Push to `staging` and confirm the staging deployment URL is updated.
- Open a PR and confirm the preview URL is posted as a PR comment once CI passes.
- Check the app and verify server reads succeed (proves `DATABASE_URL` is present).
