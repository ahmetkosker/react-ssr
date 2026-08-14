# AGENTS.md

## Commands

- `yarn start:dev` — dev server: runs `yarn build` first, then esbuild watch (client+server, unminified + sourcemap) + Tailwind watch + nodemon (configured in `nodemon.json`).
- `yarn build` — compiles client pages, server and Tailwind CSS into gitignored directories. Required before `yarn start` (artifacts are not committed).
- `yarn start` — runs the compiled server only; if no build exists, `scripts/checkBuild.mjs` aborts with a clear message.
- `yarn typecheck` — `tsc --noEmit`. `yarn lint` — Prettier check + ESLint (flat config `eslint.config.mjs`); typecheck runs separately.
- `yarn lint:fix` / `yarn format` — ESLint auto-fix / format with Prettier.
- `yarn test` — node:test via ts-node. Single file: `node --require ts-node/register --test tests/server/config.test.ts`.
- `yarn generate:page <Name>` — scaffolds a new page (component + client.ts + shared type + route registration in server.tsx; markers: `// GENERATE:TYPE`, `// GENERATE:IMPORT`, `// GENERATE:ROUTE`).
- `yarn ci` — full verification chain (lint → typecheck → test → build); CI runs exactly this.

## Structure and architecture

- Yarn 4 (node-modules linker), Express + React 18 SSR, esbuild, Tailwind. No framework, no bundler config files — esbuild flags live in package.json scripts.
- Node 20+ (`engines` + `.nvmrc`); Node 18 is not supported.
- Server entry `src/server/server.tsx` → `src/server/build/server.js`; per-page client entries `src/client/pages/<Page>/client.ts` → `src/client/dist/<Page>/client.js`.
- Adding a page requires 3 pieces: the page component, a `client.ts` calling `createApp`, and a `createDynamicRoute` registration in `server.tsx` whose `id` matches the page directory (it determines `<script src="/dist/<id>/client.js">`). `yarn generate:page` does this automatically.
- SSR data flow: `fetchInitialData` → `window.__DATA__` (inline script) → hydration via `src/lib/client/createApp.tsx`.
- i18n: i18next, `src/locales/{en,fr}.json`. Adding a language requires updating BOTH the `src/server/i18n.ts` and `src/client/i18n.ts` resource maps. Language resolution: `lang` cookie → Accept-Language → `en`.
- Config via process.env only (no dotenv), `src/server/config.ts`: `PORT`, `NODE_ENV`, `PUBLIC_BASE_URL`, `FETCH_TIMEOUT_MS`, `SITE_NAME`. Invalid values throw at startup (fail-fast). Full list: `.env.example`.

## Gotchas

- CSP is hardcoded in `server.tsx`; `connect-src` allows only `https://jsonplaceholder.typicode.com` — update it when adding external API calls.
- `src/client/public/index.html` exists in the repo but is unused (HTML is generated in `src/server/helpers/renderHtml.tsx`); do not edit it.
- `src/client/dist/` and `src/server/build/` are gitignored build outputs — never edit or commit them.
- Tests use `node:assert/strict` + `node:test`, in `tests/` mirroring the `src/` structure.
- `.env.example` is in `.prettierignore` because Prettier has no parser for it; it does not need formatting.
