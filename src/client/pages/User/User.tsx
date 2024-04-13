import React from "react";

const User = ({ user }: any) => {
  if (!user) {
    console.log("User is undefined");
    return <div>No user data available</div>;
  }

  return (
    <div>
      <div>{user.id}</div>
      <div>{user.title}</div>
      <div>{user.completed.toString()}</div>
      <a
        href={`http://localhost:3000/user/${user.id + 1}`}
        className="text-red-500"
      >
        Next
      </a>
    </div>
  );
};

export default User;
