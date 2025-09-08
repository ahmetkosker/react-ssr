import React from "react";
import { I18nextProvider } from "react-i18next";
import { hydrateRoot } from "react-dom/client";
import i18n from "../../client/i18n";

declare global {
  interface Window {
    __DATA__: unknown;
    __LANG__: string;
  }
}

const pageProps = window.__DATA__;

interface CreateAppProps<T = unknown> {
  Page: React.ComponentType<{ data: T }>;
}

export const createApp = <T = unknown>({ Page }: CreateAppProps<T>) => {
  const initialLang = window.__LANG__;
  i18n.changeLanguage(initialLang);

  document.addEventListener("DOMContentLoaded", () => {
    hydrateRoot(
      document.getElementById("root")!,
      <I18nextProvider i18n={i18n}>
        <Page {...(pageProps as { data: T })} />
      </I18nextProvider>
    );
  });
};
