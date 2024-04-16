import React from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../i18n";
import { hydrateRoot } from "react-dom/client";

export const createApp = (Page: any) => {
  document.addEventListener("DOMContentLoaded", () => {
    hydrateRoot(
      document.getElementById("root")!,
      <I18nextProvider i18n={i18n}>
        <Page />
      </I18nextProvider>
    );
  });
};
