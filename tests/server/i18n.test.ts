import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  resolveRequestLanguage,
  isSupportedLanguage,
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
} from "../../src/server/i18n";

function fakeRequest(cookies: Record<string, string> = {}, acceptLanguage?: string) {
  return {
    cookies,
    headers: acceptLanguage ? { "accept-language": acceptLanguage } : {},
  };
}

describe("isSupportedLanguage", () => {
  test("returns true for supported languages", () => {
    assert.equal(isSupportedLanguage("en"), true);
    assert.equal(isSupportedLanguage("fr"), true);
  });

  test("returns false for unsupported languages", () => {
    assert.equal(isSupportedLanguage("de"), false);
    assert.equal(isSupportedLanguage(""), false);
    assert.equal(isSupportedLanguage("xyz"), false);
  });
});

describe("SUPPORTED_LANGUAGES", () => {
  test("contains en and fr", () => {
    assert.ok(SUPPORTED_LANGUAGES.includes("en"));
    assert.ok(SUPPORTED_LANGUAGES.includes("fr"));
  });
});

describe("DEFAULT_LANGUAGE", () => {
  test("is en", () => {
    assert.equal(DEFAULT_LANGUAGE, "en");
  });
});

describe("resolveRequestLanguage", () => {
  test("returns language from cookie when valid", () => {
    const req = fakeRequest({ lang: "fr" });
    assert.equal(resolveRequestLanguage(req), "fr");
  });

  test("ignores invalid cookie language and falls back to accept-language", () => {
    const req = fakeRequest({ lang: "de" }, "fr-FR,fr;q=0.9");
    assert.equal(resolveRequestLanguage(req), "fr");
  });

  test("parses primary language from accept-language header", () => {
    const req = fakeRequest({}, "fr-FR,en;q=0.9");
    assert.equal(resolveRequestLanguage(req), "fr");
  });

  test("returns default when accept-language is unsupported", () => {
    const req = fakeRequest({}, "de-DE,de;q=0.9");
    assert.equal(resolveRequestLanguage(req), "en");
  });

  test("returns default when no cookie and no accept-language", () => {
    const req = fakeRequest();
    assert.equal(resolveRequestLanguage(req), "en");
  });

  test("cookie takes precedence over accept-language", () => {
    const req = fakeRequest({ lang: "en" }, "fr-FR");
    assert.equal(resolveRequestLanguage(req), "en");
  });
});
