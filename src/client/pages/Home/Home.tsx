import React, { useState } from "react";
import Navbar from "../../components/Navbar";

export default function Home({ name }: { name: string }) {
  const [times, setTimes] = useState(0);

  return (
    <div>
      <Navbar />
      <a href="/about">About</a>
      <h1 className="text-red-500">Hello {times}</h1>
      <button onClick={() => setTimes((times) => times + 1)}>ADD</button>
      <div>{name}</div>
    </div>
  );
}
