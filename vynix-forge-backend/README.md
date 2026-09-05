# Vynix Forge Backend

A real backend implementing the FREE / PRO / DEV / OWNER plan system,
server-side authorization, real compiled-artifact builds, Stripe billing,
an admin panel, and a Dev-tier API + webhooks.

This is a separate project from the existing static `index.html` Vynix
Forge dashboard. It has not been wired to that frontend yet.

## What's real vs. what needs your configuration

**Fully real and tested right now (no configuration needed to test locally):**
- Plan system (`src/lib/plans.js`) and Owner authorization (`src/lib/ownerAuth.js`)
- GitHub OAuth login, sessions, per-request server-side plan resolution
- Real builds: Free tier streams a real Electron app source zip; Pro tier
  actually runs `npm install` + `electron-builder` in a child process to
  produce a real Linux `.AppImage`; Dev tier cross-compiles a real Windows
  `.exe` via Wine. All three were verified by actually running them.
- Plan enforcement on every build/project endpoint, server-side
- Admin panel (Owner-only): user search, plan grants/revokes with an audit
  log, usage stats, build logs
- Dev API keys + webhooks with real HMAC-SHA256 signing, verified against a
  real local HTTP receiver in tests

**Requires YOUR configuration before it does anything for real users:**
- **Hosting.** This needs to run on an actual server (VM, Railway, Render,
  Fly.io, etc.) with a **persistent filesystem** (SQLite + build artifacts
  live on disk) -- it will not work on a purely serverless/stateless
  platform without modification (swap SQLite for Postgres, artifacts for
  S3/R2, etc.).
- **GitHub OAuth App** -- register one, set `GITHUB_CLIENT_ID` /
  `GITHUB_CLIENT_SECRET` / `GITHUB_CALLBACK_URL`.
- **`OWNER_USER_ID`** -- your real GitHub numeric ID. Until this is set,
  correctly, nobody is Owner. See `.env.example` for how to find it.
- **Stripe account** -- real secret key, real webhook secret, two real
  recurring Prices for Pro/Dev. Until configured, checkout endpoints return
  a clear `billing_not_configured` error rather than faking a purchase.
- **System dependencies on the build host** for Pro/Dev builds to actually
  compile (see below) -- these are real OS packages, not npm packages.

## System dependencies for real builds (Pro/Dev tiers)

The host running this backend needs, in addition to Node.js 18+:

```bash
# For Linux AppImage builds (Pro tier) -- works out of the box on most
# Debian/Ubuntu-based hosts, nothing extra needed beyond Node + npm.

# For Windows .exe cross-compilation (Dev tier) -- needs Wine:
dpkg --add-architecture i386
apt-get update
apt-get install -y --no-install-recommends wine wine64 wine32:i386
```

I actually installed and used this exact sequence in testing -- it's not
theoretical. A build server without Wine installed will fail Dev-tier
builds with a clear real error, not a fake one.

**macOS `.dmg` builds are not implemented.** electron-builder's macOS
target fundamentally requires building on real macOS hardware (Apple's own
tooling restrictions, not something Wine or any Linux workaround can get
around). If you need `.dmg` output, the honest options are: (a) run a
macOS-based CI runner (e.g., GitHub Actions' `macos-latest`) for that one
target, or (b) rent/own a real Mac build machine. This is called out here
rather than silently skipped.

## Setup

```bash
npm install
cp .env.example .env
# edit .env with real values
node src/server.js
```

## Running the tests

Everything in `test/` runs against the real Express app (via supertest)
with a real SQLite database, using a stubbed GitHub OAuth client (no real
GitHub app credentials needed to run the test suite) and, where relevant,
Stripe's own test-signing helper (no real Stripe account needed to verify
webhook signature logic).

```bash
node test/core.test.js            # Owner/plan resolution, CSRF protection
node test/free-tier.test.js       # project limits, real source export
node test/paid-tiers.test.js      # REAL cloud build + REAL .exe build (takes a few minutes)
node test/owner.test.js           # Owner bypasses all limits, never touches DB
node test/billing.test.js         # webhook signature verification, no fake payments
node test/security-matrix.test.js # the 20-point matrix from the spec
node test/admin-webhooks.test.js  # admin panel + real webhook HMAC delivery
```

`paid-tiers.test.js` is slow the first run (downloading Electron, ~150MB)
but fast afterward since npm/electron-builder cache.

## Architecture notes

- **Why SQLite, not Postgres:** simplest thing that's still real and
  ACID-safe for a single-server deploy. Swap `better-sqlite3` for `pg` if
  you need multi-server/horizontal scaling -- the `src/lib/db.js` module is
  the only place that would need to change.
- **Why a single-worker build queue:** one real build (Electron + Wine) is
  CPU/memory heavy; running many concurrently on one box would fight over
  the same Wine prefix. Pro/Dev builds queue and run one at a time. Scaling
  this to real concurrent capacity means running the worker as a separate
  process (or several) pulling from a real queue (Redis/BullMQ), not just
  bumping a concurrency number.
- **Why Owner is never a DB value:** so it can never leak into an export,
  an admin grant, a bug in a migration, or a stale cache. It's computed
  fresh from `OWNER_USER_ID` on every single request.

## Not yet done

- Frontend integration: the existing static `index.html` dashboard doesn't
  call this backend yet. It would need a base API URL config and to swap
  its current client-side-only project/build logic for calls to
  `/api/projects` and `/api/builds/*`, using the browser's cookies (from
  `/auth/github/login`) for auth.
- Retry/backoff and a visible dead-letter queue for failed webhook
  deliveries (current behavior: logs a warning server-side and moves on).
- Multi-build concurrency / horizontal scaling (see architecture notes).
- macOS `.dmg` builds (see above).
