import React from "react";
import Layout from "../../components/Layout";
import type { ErrorPageData } from "../../../shared/types";

const ErrorPage: React.FC<{ data: ErrorPageData }> = ({ data }) => {
  return (
    <Layout
      title="Something went wrong"
      subtitle="An unexpected server error occurred."
      currentPath={data?.currentPath}
    >
      <p className="text-sm text-slate-600">
        Error: <span className="font-mono text-slate-900">{data.message}</span>
      </p>

      <a
        className="mt-4 inline-block rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-900 hover:text-slate-900"
        href="/"
      >
        Return home
      </a>
    </Layout>
  );
};

export default ErrorPage;
