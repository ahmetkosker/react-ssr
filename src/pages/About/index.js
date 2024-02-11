import React from "react";
import ReactDOM from "react-dom";
import About from "./About";

import i18n from "i18next";

import translationEN from "./en.json";
import translationFR from "./fr.json";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: translationEN,
    },
    fr: {
      translation: translationFR,
    },
  },
  lng: "en", // Varsayılan dil
  fallbackLng: "en", // Hata durumunda kullanılacak dil
  interpolation: {
    escapeValue: false,
  },
});

ReactDOM.hydrate(<About />, document.getElementById("root"));
