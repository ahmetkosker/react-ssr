# Sistematik Şablon (Template Hardening) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** react-ssr şablonunu 10 kişilik ekibin sıkıntısız kullanacağı sistematik hale getirmek: kod kalitesi disiplini (ESLint+Prettier+strict TS), scaffolding script'i, dokümantasyon ve operasyonel emniyetler.

**Architecture:** Mevcut yapı korunur (Express+React18 SSR, esbuild, Tailwind, node:test). Üzerine eklenenler: flat-config ESLint + Prettier, saf fonksiyonlu `scripts/generatePage.ts` (ts-node ile çalışır, marker comment'lerle `server.tsx`/`shared/types.ts`'e ekleme yapar), fail-fast env doğrulama ve prestart build kontrolü.

**Tech Stack:** Yarn 4, TypeScript 5.3+, ESLint 9 (flat), Prettier 3, typescript-eslint, ts-node, node:test.

**Spec:** `docs/superpowers/specs/2026-08-14-sistematik-sablon-design.md`

---

### Task 1: ESLint + Prettier kurulumu ve script'ler

**Files:**

- Modify: `package.json`
- Create: `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`

- [ ] **Step 1: DevDependency'leri kur**

Run: `yarn add -D eslint @eslint/js typescript-eslint eslint-plugin-react eslint-plugin-react-hooks eslint-config-prettier prettier globals`
Expected: başarıyla kurulur, package.json devDependencies güncellenir.
Not: `eslint-plugin-react-hooks` güncel sürüm (v5+) gerekir — v4, ESLint 9+ ile uyumsuzdur. Yeni sürümün `recommended` config'i React 19 compiler kurallarını içerdiğinden klasik iki kural (`rules-of-hooks`, `exhaustive-deps`) explicit tanımlanır.

- [ ] **Step 2: Prettier config'leri yaz**

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
```

- [ ] **Step 3: ESLint flat config yaz**

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
    files: ["eslint.config.mjs", "scripts/**/*.{mjs,js}"],
    languageOptions: {
      globals: globals.node,
    },
  },
  prettier,
);
```

- [ ] **Step 4: package.json script'lerini güncelle**

```json
"typecheck": "tsc --noEmit",
"lint": "prettier --check . && eslint .",
"lint:fix": "eslint --fix .",
"format": "prettier --write .",
"test": "node --require ts-node/register --test tests/**/*.test.ts",
"ci": "yarn lint && yarn typecheck && yarn test && yarn build",
```

- [ ] **Step 5: Doğrula**

Run: `yarn lint`
Expected: prettier check geçer (henüz formatlanmadıysa bazı dosyalarda fail olabilir — Task 2'de formatlanacak; ESLint hataları varsa not al, Task 4'te düzeltilecek).

- [ ] **Step 6: Commit**

```bash
git add package.json yarn.lock eslint.config.mjs .prettierrc.json .prettierignore
git commit -m "chore: add ESLint flat config and Prettier"
```

---

### Task 2: Kod tabanını formatla

**Files:** tüm `src/`, `tests/`, `scripts/` dosyaları (Prettier ile)

- [ ] **Step 1: Format uygula**

Run: `yarn format`
Expected: dosyalar formatlanır.

- [ ] **Step 2: Testler hâlâ geçiyor mu**

Run: `yarn typecheck && yarn test`
Expected: PASS (formatlama davranışı değiştirmez).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "style: format codebase with Prettier"
```

---

### Task 3: Strict TypeScript bayrakları

**Files:**

- Modify: `tsconfig.json`

- [ ] **Step 1: Bayrakları aç**

`compilerOptions` içine ekle:

```json
"noUnusedLocals": true,
"noUnusedParameters": true,
"noImplicitReturns": true,
"noFallthroughCasesInSwitch": true
```

- [ ] **Step 2: Typecheck**

Run: `yarn typecheck`
Expected: PASS. Hata çıkarsa ilgili kodu düzelt (mevcut kodda beklenen hata yok; `_` prefix'li parametreler `noUnusedParameters`'dan muaf).

- [ ] **Step 3: Commit**

```bash
git add tsconfig.json
git commit -m "build: enable stricter TypeScript flags"
```

---

### Task 4: ESLint hatalarını temizle

**Files:** `yarn lint` çıktısındaki dosyalar

- [ ] **Step 1: Otomatik düzeltmeler**

Run: `yarn lint:fix`
Expected: düzeltilebilir hatalar çözülür.

- [ ] **Step 2: Kalan hataları elle çöz**

Run: `yarn lint`
Expected: temiz çıktı. Kurallarla çakışan istisnai durumlar varsa (örn. `server/i18n.ts`'teki `require("../locales/en.json")`) satır bazlı `// eslint-disable-next-line` yerine gerekirse config ayarlanır — yalnızca zorunluysa.

- [ ] **Step 3: Testler**

Run: `yarn typecheck && yarn test`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "lint: fix ESLint issues"
```

---

### Task 5: Config fail-fast doğrulama

**Files:**

- Modify: `src/server/config.ts`
- Create: `tests/server/configValidation.test.ts`

- [ ] **Step 1: Failing testleri yaz**

`tests/server/configValidation.test.ts` (config modülü require cache'den silinerek env değişkenleriyle yeniden yüklenir):

```ts
import assert from "node:assert/strict";
import { describe, test, afterEach } from "node:test";

// Not: require.resolve ile .ts uzantılı gerçek modül yolunu al (require.cache anahtarı budur)
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

- [ ] **Step 2: Testlerin fail olduğunu gör**

Run: `node --require ts-node/register --test tests/server/configValidation.test.ts`
Expected: FAIL (henüz throw yok).

- [ ] **Step 3: Implementasyon**

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

- [ ] **Step 4: Testler geçiyor mu**

Run: `yarn test`
Expected: 23 test PASS (17 mevcut + 6 yeni).

- [ ] **Step 5: Commit**

```bash
git add src/server/config.ts tests/server/configValidation.test.ts
git commit -m "feat: fail fast on invalid environment configuration"
```

---

### Task 6: .env.example ve README env bölümü

**Files:**

- Create: `.env.example`
- Modify: `README.md`

- [ ] **Step 1: .env.example yaz**

```
# react-ssr ortam değişkenleri (dotenv YOKTUR; bunları shell'den export edin)
# Örn: PORT=3001 yarn start

# Sunucu portu (1-65535)
PORT=3000
# development | production
NODE_ENV=development
# canonical linkler ve sitemap için kullanılan base URL (sonda slash olmasın)
PUBLIC_BASE_URL=http://localhost:3000
# Yukarı akış (JSONPlaceholder vb.) istekleri için timeout (ms)
FETCH_TIMEOUT_MS=8000
# lang cookie'sinin max yaşı (ms)
COOKIE_MAX_AGE_MS=86400000
# Sayfa başlıklarında görünen site adı
SITE_NAME=React SSR
```

- [ ] **Step 2: README'ye bölüm ekle**

"## Environment Variables" bölümü: değişken tablosu + "dotenv yok, export edin" notu + `.env.example` referansı. "## Scripts" bölümü: `build`, `start`, `start:dev`, `test`, `lint`, `format`, `typecheck`, `generate:page` tablosu.

- [ ] **Step 3: Commit**

```bash
git add .env.example README.md
git commit -m "docs: document environment variables in README and .env.example"
```

---

### Task 7: Node sürümü sabitleme

**Files:**

- Create: `.nvmrc`
- Modify: `package.json`

- [ ] **Step 1: Dosyaları yaz**

`.nvmrc`: içerik `20`

`package.json` içine (version alanından sonra):

```json
"engines": {
  "node": ">=20"
}
```

- [ ] **Step 2: Doğrula**

Run: `yarn install` (engines uyarısı olmamalı; yerel Node 23 uyumlu), `yarn typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add .nvmrc package.json
git commit -m "chore: pin Node version with .nvmrc and engines"
```

---

### Task 8: Dev sourcemap'leri

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Watch script'lerini güncelle**

```json
"build:client:watch": "esbuild src/client/pages/**/client.ts --bundle --sourcemap --loader:.js=jsx --outdir=src/client/dist/ --watch",
"build:server:watch": "esbuild src/server/server.tsx --bundle --platform=node --sourcemap --loader:.js=jsx --outfile=src/server/build/server.js --watch",
```

(`build:client:watch`'tan `--minify` kaldırılır — dev'de okunabilir bundle + sourcemap.)

- [ ] **Step 2: Smoke test**

Run: `timeout 15 yarn start:dev`
Expected: server ayağa kalkar; `src/client/dist/Home/client.js.map` ve `src/server/build/server.js.map` oluşur.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "dev: add sourcemaps and drop minification in watch builds"
```

---

### Task 9: prestart build kontrolü

**Files:**

- Create: `scripts/checkBuild.mjs`
- Modify: `package.json`

- [ ] **Step 1: Script yaz**

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

- [ ] **Step 2: start script'ine göm**

`package.json` scripts: `"start": "node scripts/checkBuild.mjs && node src/server/build/server.js"`
Not: Yarn 4, npm'in `prestart`/`poststart` hook'larını desteklemez — kontrol doğrudan `start` script'inde olmalı.

- [ ] **Step 3: Test et**

Run: `rm -rf src/server/build && yarn start` → Expected: net hata mesajı, exit 1. Sonra `yarn build && yarn start` → çalışır (Ctrl+C ile durdur).

- [ ] **Step 4: Commit**

```bash
git add scripts/checkBuild.mjs package.json
git commit -m "feat: fail with clear message when starting without build"
```

---

### Task 10: generate:page scaffolding script'i

**Files:**

- Modify: `src/server/server.tsx` (marker'lar eklenir)
- Modify: `src/shared/types.ts` (marker eklenir)
- Modify: `package.json` (script)
- Create: `scripts/generatePage.ts`
- Create: `tests/scripts/generatePage.test.ts`

- [ ] **Step 1: Marker'ları ekle**

`src/shared/types.ts` sonuna: `// GENERATE:TYPE`
`src/server/server.tsx`:

- page import'larının olduğu bloğa (import satırlarından sonra): `// GENERATE:IMPORT`
- 404 catch-all'dan hemen önce: `// GENERATE:ROUTE`

- [ ] **Step 1.5: Marker'ları ayrı commit'le** (sonraki smoke test temizliği `git checkout` yapacak; marker'lar commit'lenmiş olmalı ki kaybolmasın)

```bash
git add src/server/server.tsx src/shared/types.ts
git commit -m "chore: add generation markers for page scaffolding"
```

- [ ] **Step 2: Failing testleri yaz**

`tests/scripts/generatePage.test.ts` (saf fonksiyonlar + tmp dizinde entegrasyon):

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

- [ ] **Step 3: Testlerin fail olduğunu gör**

Run: `node --require ts-node/register --test tests/scripts/generatePage.test.ts`
Expected: FAIL (dosya yok).

- [ ] **Step 4: Script'i yaz**

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

- [ ] **Step 5: package.json script'i**

```json
"generate:page": "ts-node scripts/generatePage.ts"
```

- [ ] **Step 6: Testler geçiyor mu**

Run: `node --require ts-node/register --test tests/scripts/generatePage.test.ts`
Expected: PASS (6 test).

- [ ] **Step 7: Uçtan uca smoke test**

Run: `yarn generate:page Demo && yarn typecheck && yarn lint && yarn build`
Expected: `src/client/pages/Demo/` oluşur, route kaydı + tip import'u `server.tsx`'e girer, typecheck/lint/build geçer. Test sunucusunu başlatıp `/demo` 200 verir. Sonra Demo sayfasını sil (test artığı kalmasın): `rm -rf src/client/pages/Demo` + `git checkout src/server/server.tsx src/shared/types.ts` (marker'lar Step 1.5'te commit'lendiği için güvenle geri alınır).

- [ ] **Step 8: Commit**

```bash
git add scripts/generatePage.ts tests/scripts/generatePage.test.ts package.json src/server/server.tsx src/shared/types.ts
git commit -m "feat: add generate:page scaffolding script"
```

---

### Task 11: CONTRIBUTING.md ve dokümantasyon

**Files:**

- Create: `CONTRIBUTING.md`
- Modify: `README.md`, `AGENTS.md`

- [ ] **Step 1: CONTRIBUTING.md yaz**

Bölümler: Geliştirme ortamı (Node 20+, `corepack enable`, `yarn install`), Komutlar tablosu, Yeni sayfa ekleme (`yarn generate:page <Name>` + manuel 3 parça), i18n (iki haritanın da güncellenmesi), Ortam değişkenleri (.env.example referansı), Commit mesajları (feat/fix/refactor/test/docs/chore prefix'leri), Test yazma (node:test + assert/strict, tests/ ağacı src'i yansıtır).

- [ ] **Step 2: README güncelle**

Scripts bölümüne yeni komutlar (`test`, `lint`, `format`, `typecheck`, `generate:page`), Environment Variables bölümü (Task 6'da eklendi), "## Contributing" → `CONTRIBUTING.md` linki.

- [ ] **Step 3: AGENTS.md güncelle**

- `yarn lint` satırı: "ESLint (flat config) + `prettier --check`; typecheck ayrıdır: `yarn typecheck`"
- `yarn ci`: `lint → typecheck → test → build`
- Yeni komutlar: `yarn format`, `yarn lint:fix`, `yarn generate:page <Name>`
- Node: `.nvmrc` (20) + `engines >=20`
- Env fail-fast notu: geçersiz env değeri sunucu başlangıcını durdurur
- `prestart` kontrolü notu

- [ ] **Step 4: Commit**

```bash
git add CONTRIBUTING.md README.md AGENTS.md
git commit -m "docs: add CONTRIBUTING guide and update README and AGENTS.md"
```

---

### Task 12: Final doğrulama

- [ ] **Step 1: Yeni dosyaları formatla**

Run: `yarn format`
Expected: tüm dosyalar (inline yazılmış yeniler dahil) Prettier uyumlu olur.

- [ ] **Step 2: Tüm zincir**

Run: `yarn ci`
Expected: lint → typecheck → test → build hepsi PASS.

- [ ] **Step 3: Smoke test**

Run: `timeout 15 yarn start:dev`
Expected: server ayağa kalkar. `yarn start` build'siz çalışmaz (net hata), build'li çalışır.

- [ ] **Step 4: Working tree temizliği**

Run: `git status --short`
Expected: temiz.
