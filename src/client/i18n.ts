import i18n from "i18next";
import { initReactI18next } from "react-i18next";
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

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: "en",
  ns: ["translations"],
  defaultNS: "translations",
});

export default i18n;
