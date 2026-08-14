const parseNumber = (
  rawValue: string | undefined,
  fallback: number,
): number => {
  if (!rawValue) {
    return fallback;
  }

  const parsed = Number(rawValue);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

const port = parseNumber(process.env.PORT, 3000);

export const config = {
  env: process.env.NODE_ENV ?? "development",
  port,
  fetchTimeoutMs: parseNumber(process.env.FETCH_TIMEOUT_MS, 8000),
  cookieMaxAgeMs: parseNumber(
    process.env.COOKIE_MAX_AGE_MS,
    1000 * 60 * 60 * 24,
  ),
  publicBaseUrl: trimTrailingSlash(
    process.env.PUBLIC_BASE_URL ?? `http://localhost:${port}`,
  ),
  siteName: process.env.SITE_NAME ?? "React SSR",
};

export const isProduction = config.env === "production";
