import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

const Home: React.FC = () => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage("fr");
  }, []);

  console.log(i18n.language)

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center">
      <div>{t("welcomeMessage")}</div>
    </div>
  );
};

export default Home;
