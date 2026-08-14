# Systematic Template Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the react-ssr template systematic enough for a team of ~10 to use friction-free: code quality discipline (ESLint+Prettier+strict TS), a scaffolding script, documentation and operational safety rails.

**Architecture:** The existing structure stays (Express + React 18 SSR, esbuild, Tailwind, node:test). Additions: flat-config ESLint + Prettier, `scripts/generatePage.ts` (runs via ts-node, inserts into `server.tsx`/`shared/types.ts` at marker comments), fail-fast env validation and a start-time build check.

**Tech Stack:** Yarn 4, TypeScript 5.3+, ESLint 9 (flat), Prettier 3, typescript-eslint, ts-node, node:test.

**Spec:** `docs/superpowers/specs/2026-08-14-sistematik-sablon-design.md`

---

### Task 1: ESLint + Prettier setup and scripts

**Files:**

- Modify: `package.json`
- Create: `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`

- [ ] **Step 1: Install devDependencies**

Run: `yarn add -D eslint @eslint/js typescript-eslint eslint-plugin-react eslint-plugin-react-hooks eslint-config-prettier prettier globals`
Expected: installs successfully, package.json devDependencies updated.
Note: a current `eslint-plugin-react-hooks` (v5+) is required — v4 is incompatible with ESLint 9+. Because the new plugin's `recommended` config includes React 19 compiler rules, the two classic rules (`rules-of-hooks`, `exhaustive-deps`) are defined explicitly.

- [ ] **Step 2: Write the Prettier configs**

`.prettierrc.json`:

```json
{
  "trailingComma": "all",
  "tabWidth": 2,
  "semi": true,
  "singleQuote": false
}
```

`.prettierignore`:

```
src/client/dist
src/server/build
node_modules
bin
.yarn
.env.example
```

- [ ] **Step 3: Write the ESLint flat config**

`eslint.config.mjs`:

```js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "src/client/dist/**",
      "src/server/build/**",
      "bin/**",
      "node_modules/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: { version: "18.2.0" },
    },
    rules: {
      ...react.configs.recommended.rules,
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["eslint.config.mjs", "scripts/**/*.{mjs,js}", "*.config.js"],
    languageOptions: {
      globals: globals.node,
    },
  },
  prettier,
);
```

- [ ] **Step 4: Update package.json scripts**

```json
"typecheck": "tsc --noEmit",
"lint": "prettier --check . && eslint .",
"lint:fix": "eslint --fix .",
"format": "prettier --write .",
"test": "node --require ts-node/register --test tests/**/*.test.ts",
"ci": "yarn lint && yarn typecheck && yarn test && yarn build",
```

- [ ] **Step 5: Verify**

Run: `yarn lint`
Expected: prettier check may fail on unformatted files (formatted in Task 2); note any ESLint errors to fix in Task 4.

- [ ] **Step 6: Commit**

```bash
git add package.json yarn.lock eslint.config.mjs .prettierrc.json .prettierignore
git commit -m "chore: add ESLint flat config and Prettier"
```

---

### Task 2: Format the codebase

**Files:** all `src/`, `tests/`, `scripts/` files (with Prettier)

- [ ] **Step 1: Apply formatting**

Run: `yarn format`
Expected: files get formatted.

- [ ] **Step 2: Tests still pass**

Run: `yarn typecheck && yarn test`
Expected: PASS (formatting does not change behavior).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "style: format codebase with Prettier"
```

---

### Task 3: Strict TypeScript flags

**Files:**

- Modify: `tsconfig.json`

- [ ] **Step 1: Enable the flags**

Add to `compilerOptions` (in the top active-options section):

```json
"noUnusedLocals": true,
"noUnusedParameters": true,
"noImplicitReturns": true,
"noFallthroughCasesInSwitch": true
```

- [ ] **Step 2: Typecheck**

Run: `yarn typecheck`
Expected: PASS. If errors appear, fix the code (`_`-prefixed parameters are exempt from `noUnusedParameters`).

- [ ] **Step 3: Commit**

```bash
git add tsconfig.json
git commit -m "build: enable stricter TypeScript flags"
```

---

### Task 4: Clean up ESLint issues

**Files:** files listed in `yarn lint` output

- [ ] **Step 1: Auto-fixes**

Run: `yarn lint:fix`
Expected: fixable errors get resolved.

- [ ] **Step 2: Fix the rest manually**

Run: `yarn lint`
Expected: clean output. If a rule genuinely conflicts (e.g. `require("../locales/en.json")` in `server/i18n.ts`), prefer adjusting the code or config over `// eslint-disable-next-line` — only when necessary.

- [ ] **Step 3: Tests**

Run: `yarn typecheck && yarn test`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "lint: fix ESLint issues"
```

---

### Task 5: Config fail-fast validation

**Files:**

- Modify: `src/server/config.ts`
- Create: `tests/server/configValidation.test.ts`

- [ ] **Step 1: Write the failing tests**

`tests/server/configValidation.test.ts` (the config module is reloaded with env vars by clearing the require cache):

```ts
import assert from "node:assert/strict";
import { describe, test, afterEach } from "node:test";

// Note: use require.resolve to get the real module path with the .ts extension
// (that is the require.cache key)
const configModulePath = require.resolve("../../src/server/config");

const ENV_KEYS = [
  "PORT",
  "FETCH_TIMEOUT_MS",
  "COOKIE_MAX_AGE_MS",
  "PUBLIC_BASE_URL",
  "SITE_NAME",
  "NODE_ENV",
] as const;

const snapshot = Object.fromEntries(
  ENV_KEYS.map((key) => [key, process.env[key]]),
);

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (snapshot[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = snapshot[key];
    }
  }
});

function loadConfig(env: Record<string, string | undefined>) {
  for (const key of ENV_KEYS) delete process.env[key];
  for (const [key, value] of Object.entries(env)) {
    if (value !== undefined) process.env[key] = value;
  }
  delete require.cache[configModulePath];
  // Intentional require to reload the module with the given env vars
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require(configModulePath) as typeof import("../../src/server/config");
}

describe("config validation", () => {
  test("throws when PORT is not a number", () => {
    assert.throws(() => loadConfig({ PORT: "abc" }), /Invalid PORT/);
  });

  test("throws when PORT is out of range", () => {
    assert.throws(() => loadConfig({ PORT: "70000" }), /Invalid PORT/);
  });

  test("throws when FETCH_TIMEOUT_MS is zero or negative", () => {
    assert.throws(
      () => loadConfig({ FETCH_TIMEOUT_MS: "0" }),
      /FETCH_TIMEOUT_MS/,
    );
    assert.throws(
      () => loadConfig({ FETCH_TIMEOUT_MS: "-5" }),
      /FETCH_TIMEOUT_MS/,
    );
  });

  test("throws when PUBLIC_BASE_URL is not a valid http(s) URL", () => {
    assert.throws(
      () => loadConfig({ PUBLIC_BASE_URL: "not-a-url" }),
      /PUBLIC_BASE_URL/,
    );
    assert.throws(
      () => loadConfig({ PUBLIC_BASE_URL: "ftp://example.com" }),
      /PUBLIC_BASE_URL/,
    );
  });

  test("throws when SITE_NAME is empty", () => {
    assert.throws(() => loadConfig({ SITE_NAME: "   " }), /SITE_NAME/);
  });

  test("falls back to defaults when variables are unset", () => {
    const { config } = loadConfig({});
    assert.equal(config.port, 3000);
    assert.equal(config.fetchTimeoutMs, 8000);
  });
});
```

- [ ] **Step 2: Watch the tests fail**

Run: `node --require ts-node/register --test tests/server/configValidation.test.ts`
Expected: FAIL (nothing throws yet).

- [ ] **Step 3: Implementation**

`src/server/config.ts`:

```ts
const parseNumber = (
  envName: string,
  rawValue: string | undefined,
  fallback: number,
): number => {
  if (!rawValue) {
    return fallback;
  }

  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid ${envName}: "${rawValue}" is not a number`);
  }

  return parsed;
};

const requirePositive = (envName: string, value: number): number => {
  if (value <= 0) {
    throw new Error(`Invalid ${envName}: ${value} must be greater than 0`);
  }
  return value;
};

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

const port = parseNumber("PORT", process.env.PORT, 3000);
if (port < 1 || port > 65535) {
  throw new Error(`Invalid PORT: ${port} must be between 1 and 65535`);
}

const resolvePublicBaseUrl = (
  rawValue: string | undefined,
  fallback: string,
): string => {
  const candidate = trimTrailingSlash(rawValue || fallback);
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error(
      `Invalid PUBLIC_BASE_URL: "${candidate}" is not a valid URL`,
    );
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(
      `Invalid PUBLIC_BASE_URL: "${candidate}" must use http or https`,
    );
  }
  return candidate;
};

const resolveSiteName = (
  rawValue: string | undefined,
  fallback: string,
): string => {
  const siteName = rawValue ?? fallback;
  if (siteName.trim() === "") {
    throw new Error("Invalid SITE_NAME: must not be empty");
  }
  return siteName;
};

export const config = {
  env: process.env.NODE_ENV ?? "development",
  port,
  fetchTimeoutMs: requirePositive(
    "FETCH_TIMEOUT_MS",
    parseNumber("FETCH_TIMEOUT_MS", process.env.FETCH_TIMEOUT_MS, 8000),
  ),
  cookieMaxAgeMs: requirePositive(
    "COOKIE_MAX_AGE_MS",
    parseNumber(
      "COOKIE_MAX_AGE_MS",
      process.env.COOKIE_MAX_AGE_MS,
      1000 * 60 * 60 * 24,
    ),
  ),
  publicBaseUrl: resolvePublicBaseUrl(
    process.env.PUBLIC_BASE_URL,
    `http://localhost:${port}`,
  ),
  siteName: resolveSiteName(process.env.SITE_NAME, "React SSR"),
};

export const isProduction = config.env === "production";
```

- [ ] **Step 4: Tests pass**

Run: `yarn test`
Expected: 23 tests PASS (17 existing + 6 new).

- [ ] **Step 5: Commit**

```bash
git add src/server/config.ts tests/server/configValidation.test.ts
git commit -m "feat: fail fast on invalid environment configuration"
```

---

### Task 6: .env.example and README env section

**Files:**

- Create: `.env.example`
- Modify: `README.md`

- [ ] **Step 1: Write .env.example**

```
# react-ssr environment variables
# NOTE: dotenv is NOT used; export these from your shell.
# Example: PORT=3001 yarn start

# Server port (1-65535)
PORT=3000
# development | production
NODE_ENV=development
# Base URL for canonical links and sitemap (no trailing slash)
PUBLIC_BASE_URL=http://localhost:3000
# Timeout (ms) for upstream fetches (JSONPlaceholder etc.)
FETCH_TIMEOUT_MS=8000
# Max age (ms) of the lang cookie
COOKIE_MAX_AGE_MS=86400000
# Site name shown in page titles
SITE_NAME=React SSR
```

- [ ] **Step 2: Add sections to README**

"## Environment Variables" section: variable table + "no dotenv, export them" note + `.env.example` reference. "## Scripts" section: table of `build`, `start`, `start:dev`, `test`, `lint`, `format`, `typecheck`, `generate:page`.

- [ ] **Step 3: Commit**

```bash
git add .env.example README.md
git commit -m "docs: document environment variables in README and .env.example"
```

---

### Task 7: Pin the Node version

**Files:**

- Create: `.nvmrc`
- Modify: `package.json`

- [ ] **Step 1: Write the files**

`.nvmrc`: content `20`

In `package.json` (after the version field):

```json
"engines": {
  "node": ">=20"
}
```

- [ ] **Step 2: Verify**

Run: `yarn install` (no engines warning; local Node 23 satisfies the range), `yarn typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add .nvmrc package.json
git commit -m "chore: pin Node version with .nvmrc and engines"
```

---

### Task 8: Dev sourcemaps

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Update the watch scripts**

```json
"build:client:watch": "esbuild src/client/pages/**/client.ts --bundle --sourcemap --loader:.js=jsx --outdir=src/client/dist/ --watch",
"build:server:watch": "esbuild src/server/server.tsx --bundle --platform=node --sourcemap --loader:.js=jsx --outfile=src/server/build/server.js --watch",
```

(`--minify` is removed from `build:client:watch` — readable bundles + sourcemaps in dev.)

- [ ] **Step 2: Smoke test**

Run: `timeout 15 yarn start:dev`
Expected: server starts; `src/client/dist/Home/client.js.map` and `src/server/build/server.js.map` are created.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "dev: add sourcemaps and drop minification in watch builds"
```

---

### Task 9: Start-time build check

**Files:**

- Create: `scripts/checkBuild.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write the script**

```js
import { existsSync, readdirSync } from "node:fs";

const requiredFiles = [
  "src/server/build/server.js",
  "src/client/dist/bundle.css",
];

const missing = requiredFiles.filter((file) => !existsSync(file));

const hasClientBundles =
  existsSync("src/client/dist") &&
  readdirSync("src/client/dist", { recursive: true }).some((entry) =>
    String(entry).endsWith(".js"),
  );

if (missing.length > 0 || !hasClientBundles) {
  console.error("Compiled assets are missing:");
  for (const file of missing) {
    console.error(`  - ${file}`);
  }
  if (!hasClientBundles) {
    console.error("  - src/client/dist (no client bundles)");
  }
  console.error('Run "yarn build" first.');
  process.exit(1);
}
```

- [ ] **Step 2: Fold it into the start script**

`package.json` scripts: `"start": "node scripts/checkBuild.mjs && node src/server/build/server.js"`
Note: Yarn 4 does not support npm's `prestart`/`poststart` hooks — the check must live directly in the `start` script.

- [ ] **Step 3: Test it**

Run: `rm -rf src/server/build && yarn start` → Expected: clear error message, exit 1. Then `yarn build && yarn start` → works (stop with Ctrl+C).

- [ ] **Step 4: Commit**

```bash
git add scripts/checkBuild.mjs package.json
git commit -m "feat: fail with clear message when starting without build"
```

---

### Task 10: generate:page scaffolding script

**Files:**

- Modify: `src/server/server.tsx` (markers added)
- Modify: `src/shared/types.ts` (marker added)
- Modify: `package.json` (script)
- Create: `scripts/generatePage.ts`
- Create: `tests/scripts/generatePage.test.ts`

- [ ] **Step 1: Add the markers**

At the end of `src/shared/types.ts`: `// GENERATE:TYPE`
In `src/server/server.tsx`:

- in the page-import block (after the import lines): `// GENERATE:IMPORT`
- immediately before the 404 catch-all: `// GENERATE:ROUTE`

- [ ] **Step 1.5: Commit the markers separately** (the later smoke-test cleanup uses `git checkout`; the markers must be committed so they are not lost)

```bash
git add src/server/server.tsx src/shared/types.ts
git commit -m "chore: add generation markers for page scaffolding"
```

- [ ] **Step 2: Write the failing tests**

`tests/scripts/generatePage.test.ts` (pure functions + integration in a tmp dir):

```ts
import assert from "node:assert/strict";
import { describe, test, afterEach } from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  validatePageName,
  toKebabCase,
  generatePage,
} from "../../scripts/generatePage";

const tmpDirs: string[] = [];

afterEach(() => {
  for (const dir of tmpDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  tmpDirs.length = 0;
});

function createFixture(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "generate-page-"));
  tmpDirs.push(dir);

  fs.mkdirSync(path.join(dir, "src/shared"), { recursive: true });
  fs.mkdirSync(path.join(dir, "src/server"), { recursive: true });
  fs.writeFileSync(path.join(dir, "src/shared/types.ts"), "// GENERATE:TYPE\n");
  fs.writeFileSync(
    path.join(dir, "src/server/server.tsx"),
    [
      'import NotFound from "../client/pages/NotFound/NotFound";',
      "// GENERATE:IMPORT",
      "// GENERATE:ROUTE",
      "app.use((req, res, next) => { next(); });",
    ].join("\n"),
  );
  return dir;
}

describe("validatePageName", () => {
  test("accepts PascalCase names", () => {
    assert.deepStrictEqual(validatePageName("Home"), []);
    assert.deepStrictEqual(validatePageName("TodoList"), []);
  });

  test("rejects non-PascalCase names", () => {
    assert.notDeepStrictEqual(validatePageName("home"), []);
    assert.notDeepStrictEqual(validatePageName("todo-list"), []);
    assert.notDeepStrictEqual(validatePageName("1Todo"), []);
    assert.notDeepStrictEqual(validatePageName(""), []);
  });
});

describe("toKebabCase", () => {
  test("converts PascalCase to kebab-case", () => {
    assert.equal(toKebabCase("TodoList"), "todo-list");
    assert.equal(toKebabCase("Home"), "home");
  });
});

describe("generatePage", () => {
  test("creates page component, client entry, shared type and route registration", () => {
    const dir = createFixture();
    generatePage("Demo", { rootDir: dir, format: false });

    const pageFile = path.join(dir, "src/client/pages/Demo/Demo.tsx");
    const clientFile = path.join(dir, "src/client/pages/Demo/client.ts");
    assert.ok(fs.existsSync(pageFile));
    assert.ok(fs.existsSync(clientFile));
    assert.match(fs.readFileSync(pageFile, "utf8"), /const Demo: React\.FC/);
    assert.match(
      fs.readFileSync(clientFile, "utf8"),
      /createApp\(\{ Page: Demo \}\)/,
    );

    const types = fs.readFileSync(
      path.join(dir, "src/shared/types.ts"),
      "utf8",
    );
    assert.match(types, /export interface DemoRouteData/);

    const server = fs.readFileSync(
      path.join(dir, "src/server/server.tsx"),
      "utf8",
    );
    assert.match(server, /import Demo from "\.\.\/client\/pages\/Demo\/Demo";/);
    assert.match(
      server,
      /import type \{ DemoRouteData \} from "\.\.\/shared\/types";/,
    );
    assert.match(server, /createDynamicRoute<DemoRouteData>/);
    assert.match(server, /path: "\/demo"/);
  });

  test("rejects invalid names", () => {
    const dir = createFixture();
    assert.throws(
      () => generatePage("demo", { rootDir: dir, format: false }),
      /PascalCase/,
    );
  });

  test("refuses to overwrite an existing page", () => {
    const dir = createFixture();
    generatePage("Demo", { rootDir: dir, format: false });
    assert.throws(
      () => generatePage("Demo", { rootDir: dir, format: false }),
      /already exists/,
    );
  });
});
```

- [ ] **Step 3: Watch the tests fail**

Run: `node --require ts-node/register --test tests/scripts/generatePage.test.ts`
Expected: FAIL (file does not exist).

- [ ] **Step 4: Write the script**

`scripts/generatePage.ts`:

```ts
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

interface GenerateOptions {
  rootDir: string;
  format: boolean;
}

export function validatePageName(name: string): string[] {
  const errors: string[] = [];
  if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) {
    errors.push(
      `"${name}" is not a valid PascalCase page name (e.g. "TodoList")`,
    );
  }
  return errors;
}

export function toKebabCase(name: string): string {
  return name
    .replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)
    .replace(/^-/, "");
}

const pageComponentTemplate = (
  name: string,
): string => `import React from "react";
import Layout from "../../components/Layout";
import type { ${name}RouteData } from "../../../shared/types";

const ${name}: React.FC<{ data: ${name}RouteData }> = ({ data }) => {
  return (
    <Layout title="${name}" currentPath={data?.currentPath}>
      <p className="text-sm text-slate-600">Hello from ${name}!</p>
    </Layout>
  );
};

export default ${name};
`;

const clientEntryTemplate = (
  name: string,
): string => `import { createApp } from "../../../lib/client/createApp";
import ${name} from "./${name}";

createApp({ Page: ${name} });
`;

const sharedTypeTemplate = (name: string): string => `
export interface ${name}RouteData {
  currentPath?: string;
}
`;

const routeRegistrationTemplate = (name: string): string => `
app.use(
  createDynamicRoute<${name}RouteData>({
    path: "/${toKebabCase(name)}",
    id: "${name}",
    component: ${name},
    generateMetatag: () => ({ title: "${name}", description: "${name} page" }),
  })
);
`;

export function generatePage(name: string, options: GenerateOptions): void {
  const { rootDir } = options;
  const errors = validatePageName(name);
  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  const pageDir = path.join(rootDir, "src/client/pages", name);
  if (fs.existsSync(pageDir)) {
    throw new Error(`Page "${name}" already exists at ${pageDir}`);
  }

  fs.mkdirSync(pageDir, { recursive: true });
  fs.writeFileSync(
    path.join(pageDir, `${name}.tsx`),
    pageComponentTemplate(name),
  );
  fs.writeFileSync(path.join(pageDir, "client.ts"), clientEntryTemplate(name));

  const typesPath = path.join(rootDir, "src/shared/types.ts");
  insertAtMarker(typesPath, "// GENERATE:TYPE", sharedTypeTemplate(name));

  const serverPath = path.join(rootDir, "src/server/server.tsx");
  insertAtMarker(
    serverPath,
    "// GENERATE:IMPORT",
    `import ${name} from "../client/pages/${name}/${name}";\nimport type { ${name}RouteData } from "../shared/types";\n`,
  );
  insertAtMarker(
    serverPath,
    "// GENERATE:ROUTE",
    routeRegistrationTemplate(name),
  );

  if (options.format) {
    execSync(
      `yarn prettier --write "${pageDir}" "${typesPath}" "${serverPath}"`,
      {
        cwd: rootDir,
        stdio: "inherit",
      },
    );
  }
}

function insertAtMarker(
  filePath: string,
  marker: string,
  content: string,
): void {
  const source = fs.readFileSync(filePath, "utf8");
  if (!source.includes(marker)) {
    throw new Error(`Marker "${marker}" not found in ${filePath}`);
  }
  fs.writeFileSync(filePath, source.replace(marker, `${content}\n${marker}`));
}

function main(): void {
  const name = process.argv[2];
  if (!name) {
    console.error(
      "Usage: yarn generate:page <Name>\nExample: yarn generate:page TodoList",
    );
    process.exit(1);
  }
  try {
    generatePage(name, { rootDir: process.cwd(), format: true });
    console.log(`Page "${name}" created.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
```

- [ ] **Step 5: package.json script**

```json
"generate:page": "ts-node scripts/generatePage.ts"
```

- [ ] **Step 6: Tests pass**

Run: `node --require ts-node/register --test tests/scripts/generatePage.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 7: End-to-end smoke test**

Run: `yarn generate:page Demo && yarn typecheck && yarn lint && yarn build`
Expected: `src/client/pages/Demo/` is created, route registration + type import land in `server.tsx`, typecheck/lint/build pass. Start the test server and confirm `/demo` returns 200. Then remove the Demo page (leave no test residue): `rm -rf src/client/pages/Demo` + `git checkout src/server/server.tsx src/shared/types.ts` (safe because the markers were committed in Step 1.5).

- [ ] **Step 8: Commit**

```bash
git add scripts/generatePage.ts tests/scripts/generatePage.test.ts package.json src/server/server.tsx src/shared/types.ts
git commit -m "feat: add generate:page scaffolding script"
```

---

### Task 11: CONTRIBUTING.md and documentation

**Files:**

- Create: `CONTRIBUTING.md`
- Modify: `README.md`, `AGENTS.md`

- [ ] **Step 1: Write CONTRIBUTING.md**

Sections: Development environment (Node 20+, `corepack enable`, `yarn install`), command table, adding a page (`yarn generate:page <Name>` + the manual 3 pieces), i18n (both resource maps must be updated), environment variables (.env.example reference), commit messages (feat/fix/refactor/test/docs/chore prefixes), writing tests (node:test + assert/strict, tests/ tree mirrors src/).

- [ ] **Step 2: Update README**

Add the new commands to the Scripts section (`test`, `lint`, `format`, `typecheck`, `generate:page`), the Environment Variables section (added in Task 6), and "## Contributing" linking to `CONTRIBUTING.md`.

- [ ] **Step 3: Update AGENTS.md**

- `yarn lint` line: "ESLint (flat config) + `prettier --check`; typecheck is separate: `yarn typecheck`"
- `yarn ci`: `lint → typecheck → test → build`
- New commands: `yarn format`, `yarn lint:fix`, `yarn generate:page <Name>`
- Node: `.nvmrc` (20) + `engines >=20`
- Env fail-fast note: invalid env values stop server startup
- Start-time build check note

- [ ] **Step 4: Commit**

```bash
git add CONTRIBUTING.md README.md AGENTS.md
git commit -m "docs: add CONTRIBUTING guide and update README and AGENTS.md"
```

---

### Task 12: Final verification

- [ ] **Step 1: Format the new files**

Run: `yarn format`
Expected: all files (including the newly written ones) are Prettier-compliant.

- [ ] **Step 2: Full chain**

Run: `yarn ci`
Expected: lint → typecheck → test → build all PASS.

- [ ] **Step 3: Smoke test**

Run: `timeout 15 yarn start:dev`
Expected: server starts. `yarn start` fails without a build (clear error), works with one.

- [ ] **Step 4: Clean working tree**

Run: `git status --short`
Expected: clean.
