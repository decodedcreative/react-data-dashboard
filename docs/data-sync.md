# Trade data sync

The trades displayed in the dashboard come from one of two sources:

| Source   | Where it lives                                     | Used for                                                                     |
| -------- | -------------------------------------------------- | ---------------------------------------------------------------------------- |
| `seed`   | `prisma/seed.mjs`                                  | Fixed fixtures (`TRD-001`, `TRD-002`) used by unit / integration / e2e tests |
| `alpaca` | [Alpaca paper trading API](https://alpaca.markets) | Real order history pulled by `npm run sync:trades`                           |

Both coexist in the same `Trade` table, distinguished by the `source` column. The two operations are kept isolated:

- `npm run db:seed` only touches `source = 'seed'` rows
- `npm run sync:trades` only upserts `source = 'alpaca'` rows (keyed on `externalId`)

You can re-run either as often as you like without losing the other.

---

## Architecture

```
Alpaca API
    │
    ▼
Provider client     (src/lib/trade-sync/providers/alpaca/client.ts)
    │   strict Zod schema validates response
    ▼
Provider mapper    (src/lib/trade-sync/providers/alpaca/mapper.ts)
    │   AlpacaOrder → MappedTrade (domain shape)
    ▼
Sync orchestrator   (src/lib/trade-sync/sync.ts)
    │   for each MappedTrade: prisma.trade.upsert by externalId
    ▼
Postgres
    │
    ▼
Next.js read path  (unchanged — server components → Prisma → trades grid)
```

The orchestrator is provider-agnostic. Adding a new data source means:

1. Add a value to the `TradeSource` enum in `prisma/schema.prisma`
2. Add a directory under `src/lib/trade-sync/providers/<name>/`
3. Export a `TradeProvider` from that directory's `index.ts`
4. Wire it up in `scripts/sync-trades.ts`

No orchestrator changes required.

---

## Prerequisites

1. **Sign up for an Alpaca paper account** at <https://app.alpaca.markets/signup>. Paper-only access does not require an SSN.
2. **Generate paper API keys** from <https://app.alpaca.markets/paper/dashboard/overview> (sidebar → "API Keys"). The secret is shown once — copy both immediately.
3. **Place a few paper trades** so the sync has something to pull. The dashboard's "Trade" panel works, or you can use Alpaca's order placement API. A mix of market / limit / stop orders gives the mapper varied data to handle.
4. **Configure env vars** in `.env.local`:

```env
ALPACA_API_KEY_ID=PK...
ALPACA_API_SECRET_KEY=...
ALPACA_BASE_URL=https://paper-api.alpaca.markets
ALPACA_TRADER_NAME=Your Name
```

`ALPACA_BASE_URL` defaults to the paper endpoint and rarely needs overriding. `ALPACA_TRADER_NAME` is the value written into the DB `trader` column for synced rows — Alpaca doesn't expose a per-order trader identity, so we pick one.

---

## Running the sync

```bash
docker compose up -d postgres   # if not already running
npm run sync:trades
```

Output looks like:

```
[trade-sync] starting sync from provider=alpaca
[trade-sync] sync complete { fetched: 15, upserted: 15, errors: 0 }
[sync:trades] done { fetched: 15, upserted: 15, errors: 0 }
```

| Counter    | Meaning                                                                                                                                                                            |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fetched`  | Trades the provider yielded after its internal mapping. Orders without a usable price (typically unfilled market orders pre-fill) are dropped here and don't increment any counter |
| `upserted` | Rows successfully written to Postgres                                                                                                                                              |
| `errors`   | Rows whose upsert threw. The orchestrator continues past individual failures — one bad row doesn't abort the run. Exit code is non-zero when this is > 0                           |

The script is idempotent: re-running converges on the same DB state because every row is upserted by its `externalId` (Alpaca order UUID), which is `UNIQUE` in the schema.

---

## How the mapper handles Alpaca's quirks

### Status mapping

Alpaca exposes 17 order statuses; our domain has 3. The full mapping lives in [`mapper.ts`](../src/lib/trade-sync/providers/alpaca/mapper.ts) and is exhaustive — any future status added to the schema enum but not to the mapper switch causes a TypeScript build error.

| Alpaca                                                                                                                                                 | Domain      | Why                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- | ----------------------------------------------------------- |
| `filled`, `calculated`, `stopped`                                                                                                                      | `filled`    | Order completed (stops are guaranteed-fill per Alpaca docs) |
| `new`, `partially_filled`, `pending_new`, `accepted`, `accepted_for_bidding`, `pending_cancel`, `pending_replace`, `done_for_day`, `suspended`, `held` | `pending`   | Order is still live in some way                             |
| `canceled`, `expired`, `rejected`, `replaced`                                                                                                          | `cancelled` | Terminal — order will never fill                            |

### Quantity

For filled orders we use `filled_qty` (what actually moved). For pending / cancelled orders we use the requested `qty` (the intended size).

### Price

Preference order: `filled_avg_price` → `limit_price` → `stop_price`. If none are present (typically an unfilled market order), the mapper returns `null` and the orchestrator silently skips the row — we don't emit a meaningless `0`.

### Executed timestamp

Preference order: `filled_at` → `canceled_at` → `expired_at` → `submitted_at` → `created_at`. Microsecond-precision timestamps (which RFC 3339 forbids) are accepted; we parse with `new Date(...)` and validate.

### Trader

Not exposed by Alpaca's order objects, so we fill from `ALPACA_TRADER_NAME`. Documented as a known synthetic value.

---

## Schema drift

The Alpaca external schema in [`schemas.ts`](../src/lib/trade-sync/providers/alpaca/schemas.ts) is `.strict()` — if Alpaca adds a new field to their order shape, the parse throws and the sync surfaces the error. This is intentional: silent drift is worse than a loud failure.

To accept the new field, add it to `AlpacaOrderSchema` (and the mapper if it should affect the domain).

The reference fixture under [`__fixtures__/orders-real.json`](../src/lib/trade-sync/providers/alpaca/__fixtures__/orders-real.json) is captured from a real paper-trading response and committed for reproducibility — schema tests parse it as a smoke check.

---

## Known limitations

These are scoped out of the initial integration (RDDB-78) and would each be follow-up tickets:

- **No incremental sync.** Every run fetches every order. Fine for paper-account scale; would need cursor tracking to handle production volume.
- **No scheduled sync.** Runs on-demand only. A Vercel cron or GitHub Action could trigger it on an interval.
- **No streaming.** Alpaca exposes a WebSocket for live order updates. Out of scope.
- **No `replaced_by` chain traversal.** A replaced order's UUID is a different row from its replacement. The chain is preserved in `externalId`s but the orchestrator doesn't follow it.
- **Trader is synthetic.** Alpaca's account model is single-trader-per-account, so we attribute every synced row to the env-configured name.

---

## CI

The sync script is **never** invoked by CI. The orchestrator is unit-tested with a mocked provider, and the Alpaca client is unit-tested with a stubbed `fetch` — so all coverage runs offline. Alpaca credentials are local-only.
