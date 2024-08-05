import React from "react";
import { I18nextProvider } from "react-i18next";
import { hydrateRoot } from "react-dom/client";
import i18n from "../../client/i18n";

const pageProps = (window as any).__DATA__;

interface CreateAppProps {
  Page: React.ComponentType<any>;
}

export const createApp = ({ Page }: CreateAppProps) => {
  const initialLang = (window as any).__LANG__;
  i18n.changeLanguage(initialLang);

  document.addEventListener("DOMContentLoaded", () => {
    hydrateRoot(
      document.getElementById("root")!,
      <I18nextProvider i18n={i18n}>
        <Page {...pageProps} />
      </I18nextProvider>
    );
  });
};
