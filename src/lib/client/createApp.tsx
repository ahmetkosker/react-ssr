import React from "react";
import { I18nextProvider } from "react-i18next";
import { hydrateRoot } from "react-dom/client";
import i18next from "i18next";

const pageProps = (window as any).__DATA__;

interface CreateAppProps {
  Page: React.ComponentType<any>;
}
export const createApp = ({ Page }: CreateAppProps) => {
  document.addEventListener("DOMContentLoaded", () => {
    hydrateRoot(
      document.getElementById("root")!,
      <I18nextProvider i18n={i18next}>
        <Page {...pageProps} />
      </I18nextProvider>
    );
  });
};
