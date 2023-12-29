import React, { useEffect, useState } from "react";

export default function App() {
  const [times, setTimes] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimes((prev: number) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <h1>Hello {times}</h1>
      <button onClick={() => setTimes((times) => times + 1)}>ADD</button>
    </div>
  );
}
