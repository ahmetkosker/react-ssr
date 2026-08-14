# Contributing

Workflows for the team using this template.

## Development environment

1. Node 20+ (see `.nvmrc`) and Yarn 4 (`corepack enable`)
2. `yarn install`
3. `yarn start:dev` — build + watch (client/server/Tailwind) + nodemon

## Commands

| Command                     | Description                                          |
| --------------------------- | ---------------------------------------------------- |
| `yarn start:dev`            | Build first, then dev server in watch mode           |
| `yarn build`                | Production build (client + server + Tailwind CSS)    |
| `yarn start`                | Run the compiled server (fails clearly if not built) |
| `yarn test`                 | Unit tests (node:test)                               |
| `yarn lint`                 | Prettier check + ESLint                              |
| `yarn lint:fix`             | Auto-fix ESLint issues                               |
| `yarn format`               | Format the codebase with Prettier                    |
| `yarn typecheck`            | `tsc --noEmit`                                       |
| `yarn generate:page <Name>` | Scaffold a new page                                  |
| `yarn ci`                   | Full verification: lint → typecheck → test → build   |

## Adding a page

### Via the script (recommended)

```bash
yarn generate:page TodoList
```

This creates:

- `src/client/pages/TodoList/TodoList.tsx` (page component with Layout)
- `src/client/pages/TodoList/client.ts` (hydration entry)
- `TodoListRouteData` type in `src/shared/types.ts`
- Route registration and imports for `/todo-list` in `src/server/server.tsx`

The page name must be PascalCase (e.g. `TodoList`). Reusing an existing name fails with an error.

### Manually

1. `src/client/pages/<Name>/<Name>.tsx` — the page component (with a `data` prop)
2. `src/client/pages/<Name>/client.ts` — `createApp({ Page: <Name> })`
3. `src/server/server.tsx` — a `createDynamicRoute` registration whose `id` matches the page directory (the hydration script is loaded as `/dist/<id>/client.js`)
4. `src/shared/types.ts` — the route data type

## i18n

- Translation files: `src/locales/{en,fr}.json`
- Adding a language requires updating BOTH the `src/server/i18n.ts` and `src/client/i18n.ts` resource maps
- Language resolution: `lang` cookie → Accept-Language → `en`

## Environment variables

- No dotenv; variables are exported from the shell
- Full list and defaults: `.env.example`
- Invalid values (e.g. `PORT=abc`) fail fast at startup with a clear message

## Tests

- Framework: node:test + `node:assert/strict`
- The `tests/` tree mirrors `src/` (e.g. `tests/server/…`, `tests/scripts/…`)
- Single file: `node --require ts-node/register --test tests/server/config.test.ts`

## Commit messages

Prefixes are used (consistent with repo history):

- `feat:` new feature
- `fix:` bug fix
- `refactor:` restructuring without behavior change
- `test:` test additions/updates
- `docs:` documentation
- `chore:` tooling/config maintenance
- `style:` formatting
- `dev:` developer experience improvements
