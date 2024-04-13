import React from "react";
import ReactDOM from "react-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../../i18n";
import Home from "./Home";

ReactDOM.hydrate(
  <I18nextProvider i18n={i18n}>
    <Home name={"ahmet"} />
  </I18nextProvider>,

  document.getElementById("root")
);
