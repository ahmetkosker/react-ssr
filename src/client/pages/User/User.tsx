import React from "react";

type User = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

const User: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="text-red-500">
      <a href="/ahmet">Back</a>
      <div>{data.id}</div>
      <div>{data.title}</div>
    </div>
  );
};

export default User;
