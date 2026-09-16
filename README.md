# InsertCoin (Next.js)

Play arcade, console and handheld games in the browser. InsertCoin is a game catalog with per-system pages, search and filters, favorites, recently played games and save states. The in-browser player is [EmulatorJS](https://emulatorjs.org).

> **No ROMs or BIOS files are included.** Only use files you legally own.

A Vue 3 version (`insertcoin-vue3`) will reuse the same `data/*.json` files and Zod schemas.

## Stack

| Concern         | Choice                                                                                |
| --------------- | ------------------------------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router, Turbopack, React 19.2, React Compiler, typed routes)          |
| Language        | TypeScript (strict, `noUncheckedIndexedAccess`)                                       |
| Validation      | Zod 4: data files, API query and response, env vars, IndexedDB records                |
| State           | Redux Toolkit 2 (`combineSlices`, entity adapter, slice selectors)                    |
| Side effects    | Redux-Saga: debounced and cancellable search, emulator session lifecycle, persistence |
| UI              | Tailwind CSS 4 + shadcn/ui (Base UI), lucide icons, sonner toasts                     |
| Storage         | IndexedDB via `idb` (favorites, recent, save states)                                  |
| Quality         | ESLint 9 flat config, Prettier, Husky + lint-staged, Vitest 5, Playwright             |
| Package manager | pnpm                                                                                  |

## Getting started

```bash
pnpm install
cp .env.example .env.local   # optional, the defaults work
pnpm dev
```

Open http://localhost:3000.

### Adding games

1. Put your files in `public/`, using the paths shown on each game's page under **Files needed**:
   - ROMs: `public/roms/<system>/<rom>`, for example `public/roms/snes/super-metroid.sfc`
   - BIOS: `public/bios/<system>/<file>`, for example `public/bios/neogeo/neogeo.7z`
2. To add a new game, add an entry to `data/games.json`. The data is validated when the app starts, so a typo in a system id or a wrong file extension stops the build with a readable error.
3. To add a new system, add an entry to `data/systems.json`. `core` must be an EmulatorJS system key (see `EjsCoreSchema` in `src/features/systems/schemas.ts`).

Both folders are gitignored, apart from the `.gitkeep` files.

### Supported systems

| System                            | EmulatorJS core              | BIOS                                                             |
| --------------------------------- | ---------------------------- | ---------------------------------------------------------------- |
| Neo Geo                           | `arcade` (FBNeo)             | **required**: `neogeo.7z`, an archive that contains `neogeo.zip` |
| Capcom CPS 1/2/3                  | `arcade` (FBNeo)             | none                                                             |
| MAME 2003-Plus                    | `mame`                       | depends on the game                                              |
| NES, SNES, N64                    | `nes`, `snes`, `n64`         | none                                                             |
| Game Boy / Color / Advance        | `gb`, `gba`                  | GBA: optional `gba_bios.bin`                                     |
| Genesis, Master System, Game Gear | `segaMD`, `segaMS`, `segaGG` | none                                                             |
| PlayStation                       | `psx`                        | optional (recommended) `scph5501.bin`                            |
| PC Engine, Atari 2600             | `pce`, `atari2600`           | none                                                             |

Arcade clone sets such as `kf2k2plc` also need their parent set (`kof2002.zip`), which goes in the same folder.

## Scripts

| Script                          | What it does                                                                                                          |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                      | Dev server (Turbopack)                                                                                                |
| `pnpm build` / `pnpm start`     | Production build and server                                                                                           |
| `pnpm lint`                     | ESLint                                                                                                                |
| `pnpm typecheck`                | Generates route types, then runs `tsc --noEmit`                                                                       |
| `pnpm test` / `pnpm test:watch` | Vitest unit tests (schemas, reducers, sagas, components)                                                              |
| `pnpm test:e2e`                 | Playwright smoke tests against `pnpm start`. Run `pnpm build` first, and `pnpm exec playwright install chromium` once |
| `pnpm format`                   | Prettier                                                                                                              |

## Architecture

```
data/                     systems.json + games.json (shared with the Vue version)
src/app/                  routes: / · /systems/[system] · /games/[slug] · /play/[slug] · /favorites · /api/*
src/features/<feature>/   slice, saga, schemas and components, grouped by feature
  systems/                registry schema + slice
  catalog/                game schema, filterGames, API client, debounced search saga
  library/                favorites + recently played (IndexedDB)
  emulator/               buildEjsConfig (pure), EmulatorJS bridge, session saga, player
  saves/                  save states (IndexedDB) + panel
src/lib/                  store, env, data loader, IndexedDB access
```

- **Data flow:** `lib/data.ts` parses the JSON files on the server. The root layout passes systems and games into `StoreProvider` as preloaded state, so the first render already has data. Sagas that touch browser APIs wait for `app/started`, which is dispatched after hydration.
- **Search:** `catalogSaga` debounces typing by 300 ms. Each new query cancels the previous task, which aborts any in-flight `fetch`. Responses are validated with Zod.
- **Emulator:** `buildEjsConfig` maps a game and its system to `EJS_*` globals. The session saga HEAD-checks each file. A missing required file shows its expected path. A missing optional BIOS is dropped. Otherwise the saga injects the loader and bridges the EmulatorJS callbacks through an `eventChannel`. EmulatorJS can't be torn down, so leaving the play page does a full reload.
- **Threads:** only PSP and DOS cores need `SharedArrayBuffer`. Set `NEXT_PUBLIC_EJS_THREADS=true` to add COOP/COEP headers on `/play/*`.

## Windows + OneDrive note

`node_modules`, `.next` and the pnpm store inside a OneDrive folder can cause slow installs, sync churn and "file in use" errors. Right-click the folder and choose **Always keep on this device**, or move the project out of OneDrive.
