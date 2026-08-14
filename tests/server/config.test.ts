import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { config, isProduction } from "../../src/server/config";

describe("config", () => {
  test("has expected default values", () => {
    assert.equal(typeof config.port, "number");
    assert.equal(config.port, 3000);
    assert.equal(config.fetchTimeoutMs, 8000);
    assert.equal(config.cookieMaxAgeMs, 1000 * 60 * 60 * 24);
    assert.equal(typeof config.publicBaseUrl, "string");
    assert.equal(typeof config.siteName, "string");
  });

  test("publicBaseUrl has no trailing slash", () => {
    assert.ok(!config.publicBaseUrl.endsWith("/"));
  });

  test("isProduction is false in test environment", () => {
    assert.equal(isProduction, false);
  });
});
