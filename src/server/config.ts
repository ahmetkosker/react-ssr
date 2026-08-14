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
