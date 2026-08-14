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
