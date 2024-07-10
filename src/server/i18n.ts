import i18n from "i18next";
import Backend from "i18next-fs-backend";
import { LanguageDetector } from "i18next-http-middleware";

const resources = {
  en: {
    translations: require("../locales/en.json"),
  },
  fr: {
    translations: require("../locales/fr.json"),
  },
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .init({
    resources,
    fallbackLng: "en",
    ns: ["translations"],
    defaultNS: "translations",
  });

export default i18n;
