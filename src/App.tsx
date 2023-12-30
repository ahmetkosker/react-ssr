import React, { useEffect, useState } from "react";

export default function App({ name }: { name: string }) {
  const [times, setTimes] = useState(0);

  console.log(name);

  return (
    <div>
      <h1 className="text-red-500">Hello {times}</h1>
      <button onClick={() => setTimes((times) => times + 1)}>ADD</button>
      <div>{name}</div>
    </div>
  );
}
