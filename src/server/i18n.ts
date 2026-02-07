import i18next, { i18n as I18nInstance } from "i18next";

const resources = {
  en: {
    translations: require("../locales/en.json"),
  },
  fr: {
    translations: require("../locales/fr.json"),
  },
};

type SupportedLanguage = keyof typeof resources;

const i18n = i18next.createInstance();
export const DEFAULT_LANGUAGE: SupportedLanguage = "en";
export const SUPPORTED_LANGUAGES = Object.keys(
  resources
) as SupportedLanguage[];

void i18n.init({
  resources,
  fallbackLng: DEFAULT_LANGUAGE,
  ns: ["translations"],
  defaultNS: "translations",
  initImmediate: false,
});

export function isSupportedLanguage(
  language: string
): language is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(language as SupportedLanguage);
}

export async function createRequestI18n(language: string): Promise<I18nInstance> {
  const requestI18n = i18n.cloneInstance({ initImmediate: false });
  const resolvedLanguage = isSupportedLanguage(language)
    ? language
    : DEFAULT_LANGUAGE;

  await requestI18n.changeLanguage(resolvedLanguage);

  return requestI18n;
}

export default i18n;
