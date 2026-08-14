import { HttpError } from "../errors";

interface FetchJsonOptions {
  timeoutMs?: number;
}

export async function fetchJson<T>(
  url: string,
  options: FetchJsonOptions = {},
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? 8000;
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new HttpError(
        response.status,
        `Request failed with status ${response.status} for ${url}`,
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new HttpError(
        504,
        `Request timed out after ${timeoutMs}ms for ${url}`,
      );
    }

    throw error;
  } finally {
    clearTimeout(timeoutHandle);
  }
}
