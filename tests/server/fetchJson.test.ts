import assert from "node:assert/strict";
import { after, test } from "node:test";
import { fetchJson } from "../../src/server/helpers/fetchJson";

const originalFetch = global.fetch;

after(() => {
  global.fetch = originalFetch;
});

test("fetchJson returns parsed json when request succeeds", async () => {
  global.fetch = (async () =>
    ({
      ok: true,
      status: 200,
      json: async () => ({ message: "ok" }),
    }) as Response) as typeof fetch;

  const result = await fetchJson<{ message: string }>("https://example.com");

  assert.deepStrictEqual(result, { message: "ok" });
});

test("fetchJson throws on non-success status codes", async () => {
  global.fetch = (async () =>
    ({
      ok: false,
      status: 503,
      json: async () => ({}),
    }) as Response) as typeof fetch;

  await assert.rejects(
    () => fetchJson("https://example.com"),
    /Request failed with status 503/
  );
});
