const parseNumber = (rawValue: string | undefined, fallback: number): number => {
  if (!rawValue) {
    return fallback;
  }

  const parsed = Number(rawValue);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  env: process.env.NODE_ENV ?? "development",
  port: parseNumber(process.env.PORT, 3000),
  fetchTimeoutMs: parseNumber(process.env.FETCH_TIMEOUT_MS, 8000),
  cookieMaxAgeMs: parseNumber(process.env.COOKIE_MAX_AGE_MS, 1000 * 60 * 60 * 24),
};

export const isProduction = config.env === "production";
