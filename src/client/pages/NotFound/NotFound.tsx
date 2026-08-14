import React from "react";
import Layout from "../../components/Layout";
import type { NotFoundData } from "../../../shared/types";

const NotFound: React.FC<{ data: NotFoundData }> = ({ data }) => {
  return (
    <Layout
      title="Page not found"
      subtitle="The page you requested does not exist."
      currentPath={data?.currentPath}
    >
      <p className="text-sm text-slate-600">
        Requested path: <span className="font-mono text-slate-900">{data.path}</span>
      </p>

      <a
        className="mt-4 inline-block rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-900 hover:text-slate-900"
        href="/"
      >
        Go to homepage
      </a>
    </Layout>
  );
};

export default NotFound;
