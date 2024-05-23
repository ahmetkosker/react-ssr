import React from "react";

interface AhmetProps {
  data: any;
}

const Ahmet: React.FC<AhmetProps> = ({ data }) => {
  const users = data;

  return (
    <div>
      <h1>Ahmet's Page</h1>

      <ul>
        {users.map((user: any) => (
          <a
            href={`user/${user.id}`}
            rel="noreferrer"
          >
            <li key={user.id}>{user.title}</li>
          </a>
        ))}
      </ul>
    </div>
  );
};

export default Ahmet;
