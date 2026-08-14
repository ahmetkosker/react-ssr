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
