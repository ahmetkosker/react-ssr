import i18next, { i18n as I18nInstance } from "i18next";
import type { Request } from "express";
import translationEN from "../locales/en.json";
import translationFR from "../locales/fr.json";

const resources = {
  en: {
    translations: translationEN,
  },
  fr: {
    translations: translationFR,
  },
};

type SupportedLanguage = keyof typeof resources;

const i18n = i18next.createInstance();
export const DEFAULT_LANGUAGE: SupportedLanguage = "en";
export const SUPPORTED_LANGUAGES = Object.keys(
  resources,
) as SupportedLanguage[];

void i18n.init({
  resources,
  fallbackLng: DEFAULT_LANGUAGE,
  ns: ["translations"],
  defaultNS: "translations",
  initImmediate: false,
});

export function isSupportedLanguage(
  language: string,
): language is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(language as SupportedLanguage);
}

export function resolveRequestLanguage(
  request: Pick<Request, "cookies" | "headers">,
): string {
  const cookieLanguage = request.cookies?.lang;
  if (
    typeof cookieLanguage === "string" &&
    isSupportedLanguage(cookieLanguage)
  ) {
    return cookieLanguage;
  }

  const acceptLanguage = request.headers["accept-language"];
  if (typeof acceptLanguage !== "string") {
    return DEFAULT_LANGUAGE;
  }

  const primaryLanguage = acceptLanguage.split(",")[0]?.split("-")[0]?.trim();
  if (primaryLanguage && isSupportedLanguage(primaryLanguage)) {
    return primaryLanguage;
  }

  return DEFAULT_LANGUAGE;
}

export async function createRequestI18n(
  language: string,
): Promise<I18nInstance> {
  const requestI18n = i18n.cloneInstance({ initImmediate: false });
  const resolvedLanguage = isSupportedLanguage(language)
    ? language
    : DEFAULT_LANGUAGE;

  await requestI18n.changeLanguage(resolvedLanguage);

  return requestI18n;
}

export default i18n;
