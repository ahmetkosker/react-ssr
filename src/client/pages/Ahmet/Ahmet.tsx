import React from "react";
import Layout from "../../components/Layout";
import type { TodoListRouteData } from "../../../shared/types";

const Ahmet: React.FC<{ data: TodoListRouteData }> = ({ data }) => {
  const todos = data?.todos ?? [];

  return (
    <Layout
      title="Todos"
      subtitle="Fetched from JSONPlaceholder"
      currentPath={data?.currentPath}
    >
      <ul className="space-y-2">
        {todos.map((todo) => (
          <li key={todo.id}>
            <a
              className="block rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 hover:border-slate-900 hover:text-slate-900"
              href={`/user/${todo.id}`}
            >
              {todo.title}
            </a>
          </li>
        ))}
      </ul>
    </Layout>
  );
};

export default Ahmet;
