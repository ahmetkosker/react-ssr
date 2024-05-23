import React from "react";
import { useTranslation } from "react-i18next";

const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center">
      <button onClick={() => i18n.changeLanguage("en")}>asdasdasdfasdfasdf
      </button>
      <button onClick={() => i18n.changeLanguage("fr")}>FR</button>

      <div>{t("introduction")}</div>
    </div>
  );
};

export default Home;
