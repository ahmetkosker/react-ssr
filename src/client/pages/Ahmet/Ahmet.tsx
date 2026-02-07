import React from "react";
import Layout from "../../components/Layout";

type User = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

interface AhmetProps {
  data: {
    users: User[];
    currentPath?: string;
  };
}

const Ahmet: React.FC<AhmetProps> = ({ data }) => {
  const users = data?.users ?? [];

  return (
    <Layout
      title="Todos"
      subtitle="Fetched from JSONPlaceholder"
      currentPath={data?.currentPath}
    >
      <ul className="space-y-2">
        {users.map((user: User) => (
          <li key={user.id}>
            <a
              className="block rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 hover:border-slate-900 hover:text-slate-900"
              href={`/user/${user.id}`}
            >
              {user.title}
            </a>
          </li>
        ))}
      </ul>
    </Layout>
  );
};

export default Ahmet;
