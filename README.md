# Vynix Forge

An original web-based Minecraft launcher creation platform — build, brand,
and configure a launcher project, then generate real source you can compile
into a native app.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL. Everything runs in your browser — projects are
stored in IndexedDB, nothing is uploaded anywhere.

## What's implemented in this pass

- **Dashboard shell**: persistent nav rail (Overview, Projects, Servers,
  Build Center, Files, Updates, Settings), real (non-fabricated) stats,
  honest empty states everywhere.
- **Projects**: create (with starting templates), duplicate, archive,
  delete, export config as JSON.
- **Launcher Studio** (per project): Identity, Branding (with live preview
  and image upload), Layout & Features toggles, Minecraft & Server config
  with real validation, Mods (local file categories + a real Modrinth
  search/import integration hitting the public Modrinth API), a full
  Preview screen built from actual saved config, and a Generate & Build
  tab that validates the project and produces a real downloadable source
  .zip (via JSZip) — it does not fake compiling a native installer, since
  that genuinely requires a build environment (GitHub Actions hook is
  stubbed and clearly marked as not connected).
- **Cross-project views**: Servers, Builds (with build logs), Files,
  Updates/releases, Settings.

## What's intentionally stubbed

GitHub repository connection (for real GitHub Actions builds that produce
.exe/.AppImage/.dmg artifacts) is shown in the UI but disabled — wiring
that up needs a real GitHub App/OAuth flow and Actions workflow, which is
a genuine backend feature outside the free browser-only core.

## Stack

Vite + React + React Router (hash routing) + Tailwind v4 + Dexie
(IndexedDB) + JSZip + lucide-react icons.
