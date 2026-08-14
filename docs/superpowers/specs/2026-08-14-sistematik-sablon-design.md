# 2026-08-14 Systematic Template Hardening — Design

## Goal

Turn the react-ssr template into a systematic starting point that a team of
~10 developers can use friction-free. Three priorities: code quality
discipline, zero-friction dev experience, and a contribution guide.

## Scope

### 1. Code quality discipline

- Add ESLint (flat config) + Prettier:
  - `eslint`, `typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-config-prettier`, `prettier`
- Scripts:
  - `format` = `prettier --write .`
  - `lint` = `prettier --check . && eslint .`
  - `lint:fix` = `eslint --fix .`
  - `typecheck` stays separate (`tsc --noEmit`)
  - `ci` = `yarn lint && yarn typecheck && yarn test && yarn build`
- Enable `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`,
  `noFallthroughCasesInSwitch` in tsconfig; fix any resulting type errors.
- Format the codebase once with Prettier (separate commit).
- Prettier settings match the existing style: 2 spaces, double quotes,
  semicolons, `trailingComma: "all"`.

### 2. Scaffolding: `yarn generate:page <Name>`

- `scripts/generatePage.ts` (run via ts-node, already a devDependency —
  validation functions are exported for testability):
  - Name validation: PascalCase and uniqueness; clear error messages.
  - Generates:
    - `src/client/pages/<Name>/<Name>.tsx` (page component with Layout)
    - `src/client/pages/<Name>/client.ts` (`createApp` call)
    - `<Name>RouteData` type in `src/shared/types.ts` (marker: `// GENERATE:TYPE`)
    - `createDynamicRoute` registration in `src/server/server.tsx` (marker: `// GENERATE:ROUTE`)
  - Generated files are formatted with `prettier --write`.
- Validation functions are unit-tested with node:test.

### 3. Documentation

- `CONTRIBUTING.md`: adding a page (script + manual path), i18n flow, env
  variables, command table, commit conventions.
- README: environment variables section, new scripts, CONTRIBUTING link.
- AGENTS.md: updated for the changed commands.

### 4. Operational safety rails

- `src/server/config.ts` fail-fast: set-but-invalid values (e.g. `PORT=abc`,
  malformed `PUBLIC_BASE_URL`) throw at startup with clear messages; existing
  defaults remain for unset variables. Tests added.
- `.env.example`: all variables + defaults + descriptions.
- `.nvmrc` (`20`) and `package.json` `engines: { "node": ">=20" }` (CI parity).
- Dev watch builds: drop minification, add `--sourcemap`.
- `start` build check: clear error when artifacts are missing
  (`scripts/checkBuild.mjs`, folded into the `start` script itself because
  Yarn 4 does not support `prestart` hooks).

### 5. CI

- Workflow unchanged; `yarn ci` runs the new chain. Node 20 kept.

## Out of scope (YAGNI)

- Pre-commit hooks (husky/lint-staged)
- Additional linters beyond ESLint, test framework changes
- Docker/deploy infrastructure

## Verification

- `yarn ci` must stay green after every step.
- End-to-end smoke test with `yarn generate:page Demo`.
- Config fail-fast behavior proven by tests.
