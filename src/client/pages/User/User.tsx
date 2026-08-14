import React from "react";
import Layout from "../../components/Layout";
import type { TodoDetailRouteData } from "../../../shared/types";

const User: React.FC<{ data: TodoDetailRouteData }> = ({ data }) => {
  const todo = data.todo;

  return (
    <Layout
      title={`Todo #${todo.id}`}
      subtitle="Todo detail"
      currentPath={data?.currentPath}
    >
      <a
        className="inline-block rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-900 hover:text-slate-900"
        href="/ahmet"
      >
        Back to todos
      </a>

      <dl className="mt-6 grid gap-3 text-sm text-slate-700">
        <div className="rounded-lg border border-slate-200 px-4 py-3">
          <dt className="font-semibold text-slate-900">Title</dt>
          <dd className="mt-1">{todo.title}</dd>
        </div>
        <div className="rounded-lg border border-slate-200 px-4 py-3">
          <dt className="font-semibold text-slate-900">Status</dt>
          <dd className="mt-1">{todo.completed ? "Completed" : "Pending"}</dd>
        </div>
      </dl>
    </Layout>
  );
};

export default User;
