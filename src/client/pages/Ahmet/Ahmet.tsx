import React from "react";

type User = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

interface AhmetProps {
  data: User[];
}

const Ahmet: React.FC<AhmetProps> = ({ data }) => {
  const users = data;

  return (
    <div>
      <h1>Ahmet's Page</h1>

      <ul>
        {users.map((user: User) => (
          <li key={user.id}>
            <a href={`/user/${user.id}`}>{user.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Ahmet;
