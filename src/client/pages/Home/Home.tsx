import React from "react";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";

const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [cookies, setCookie] = useCookies(["lang"]);

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center">
      <button
        onClick={() => {
          i18n.changeLanguage("en");
          setCookie("lang", "en");
        }}
      >
        en
      </button>
      <button
        onClick={() => {
          i18n.changeLanguage("fr");
          setCookie("lang", "fr");
        }}
      >
        fr
      </button>
      <div>{t("welcomeMessage")}</div>
    </div>
  );
};

export default Home;
