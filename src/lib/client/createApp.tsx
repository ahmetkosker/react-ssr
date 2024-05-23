import React from "react";
import { I18nextProvider } from "react-i18next";
import { hydrateRoot } from "react-dom/client";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from "../../client/locales/en.json";
import translationFR from "../../client/locales/fr.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: translationEN },
    fr: { translation: translationFR },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

const pageProps = (window as any).__DATA__;

interface CreateAppProps {
  Page: React.ComponentType<any>;
}

export const createApp = ({ Page }: CreateAppProps) => {
  document.addEventListener("DOMContentLoaded", () => {
    hydrateRoot(
      document.getElementById("root")!,
      <I18nextProvider i18n={i18n}>
        <Page {...pageProps} />
      </I18nextProvider>
    );
  });
};
