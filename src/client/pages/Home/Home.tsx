import React from "react";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import Layout from "../../components/Layout";
import type { HomeRouteData } from "../../../shared/types";

const Home: React.FC<{ data: HomeRouteData }> = ({ data }) => {
  const { t, i18n } = useTranslation();
  const [, setCookie] = useCookies(["lang"]);

  return (
    <Layout
      title={t("welcomeMessage")}
      subtitle={t("introduction")}
      currentPath={data.currentPath}
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-900 hover:text-slate-900"
          onClick={() => {
            i18n.changeLanguage("en");
            setCookie("lang", "en");
          }}
          type="button"
        >
          English
        </button>

        <button
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-900 hover:text-slate-900"
          onClick={() => {
            i18n.changeLanguage("fr");
            setCookie("lang", "fr");
          }}
          type="button"
        >
          Francais
        </button>
      </div>
    </Layout>
  );
};

export default Home;
