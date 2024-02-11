import React from "react";
import Navbar from "../../components/Navbar";
import { useTranslation, initReactI18next } from "react-i18next";

export default function About() {
  const { t, i18n } = useTranslation();
  return (
    <div>
      <Navbar />
      <div className="flex gap-x-5">
        <button onClick={() => i18n.changeLanguage("en")}>EN</button>
        <button onClick={() => i18n.changeLanguage("fr")}>FR</button>
      </div>
      <h1>{t("welcomeMessage")}</h1>
      <p>{t("introduction")}</p>
    </div>
  );
}
