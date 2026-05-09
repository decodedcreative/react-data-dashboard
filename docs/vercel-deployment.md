# Vercel Deployment Setup

This runbook configures Vercel hosting for `react-data-dashboard` across production, staging, and PR previews.

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

1. In Vercel, click **Add New... -> Project**.
2. Import `decodedcreative/react-data-dashboard`.
3. Keep framework as **Next.js** (the repo also contains `vercel.json`).

## 2. Configure production deployment

1. In **Project Settings -> Git**, set **Production Branch** to `main`.
2. In **Project Settings -> Domains**, add the production domain (if applicable).
3. In **Project Settings -> Environment Variables**, add:
   - `DATABASE_URL` for **Production** (production database connection string).

## 3. Configure staging deployment

Vercel staging is handled as a branch-targeted preview deployment:

1. Create or use a long-lived `staging` branch.
2. In **Project Settings -> Environment Variables**, add `DATABASE_URL` with target:
   - **Preview**
   - **Branch filter**: `staging`
3. (Optional) Assign a stable staging domain to the latest `staging` deployment (for example `staging.<domain>`).

## 4. Configure PR preview deployments

1. In **Project Settings -> Git**, ensure **Preview Deployments** are enabled.
2. For any preview branch except `staging`, add a fallback preview `DATABASE_URL`:
   - target: **Preview**
   - no branch filter (or a wildcard filter matching non-staging previews).
3. Open a PR and verify Vercel posts the preview URL to GitHub checks.

## 5. Configure environment variables in CLI (optional)

If you prefer CLI:

```bash
vercel link
vercel env add DATABASE_URL production
vercel env add DATABASE_URL preview
vercel env add DATABASE_URL preview --git-branch staging
```

## 6. Verify branch-to-environment mapping

- `main` -> **Production** deployment + production `DATABASE_URL`
- `staging` -> **Preview** deployment + branch-filtered staging `DATABASE_URL`
- `feature/*` / PR branches -> **Preview** deployment + default preview `DATABASE_URL`

## 7. Post-setup validation checklist

- Push to `main` and confirm a production deployment succeeds.
- Push to `staging` and confirm staging URL is updated.
- Open a PR and confirm preview deployment is created.
- Check app health page or landing page and verify server reads succeed (proves `DATABASE_URL` is present).
