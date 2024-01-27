import React from "react";
import ReactDOM from "react-dom";
import { I18nextProvider } from "react-i18next";
import About from "./About";
import i18n from "../../../i18n";

ReactDOM.hydrate(
  <I18nextProvider i18n={i18n}>
    <About />
  </I18nextProvider>,

  document.getElementById("root")
);
