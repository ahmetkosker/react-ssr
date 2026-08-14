import assert from "node:assert/strict";
import { after, test } from "node:test";
import { fetchJson } from "../../src/server/helpers/fetchJson";
import { HttpError } from "../../src/server/errors";

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

test("fetchJson throws HttpError with upstream status on non-success responses", async () => {
  global.fetch = (async () =>
    ({
      ok: false,
      status: 503,
      json: async () => ({}),
    }) as Response) as typeof fetch;

  await assert.rejects(
    () => fetchJson("https://example.com"),
    (error: unknown) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.status, 503);
      assert.match(error.message, /Request failed with status 503/);
      return true;
    }
  );
});

test("fetchJson throws HttpError 404 for missing resources", async () => {
  global.fetch = (async () =>
    ({
      ok: false,
      status: 404,
      json: async () => ({}),
    }) as Response) as typeof fetch;

  await assert.rejects(
    () => fetchJson("https://example.com/missing"),
    (error: unknown) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.status, 404);
      return true;
    }
  );
});

test("fetchJson throws HttpError 504 when request times out", async () => {
  global.fetch = ((_url: RequestInfo | URL, init?: RequestInit) =>
    new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => {
        const abortError = new Error("Aborted");
        abortError.name = "AbortError";
        reject(abortError);
      });
    })) as typeof fetch;

  await assert.rejects(
    () => fetchJson("https://example.com", { timeoutMs: 10 }),
    (error: unknown) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.status, 504);
      assert.match(error.message, /timed out after 10ms/);
      return true;
    }
  );
});
