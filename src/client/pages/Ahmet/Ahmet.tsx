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
        {users.map((user: User, i: number) => (
          <a key={i} href={`user/${user.id}`} rel="noreferrer">
            <li key={user.id}>{user.title}</li>
          </a>
        ))}
      </ul>
    </div>
  );
};

export default Ahmet;
