import React, { useEffect, FC } from "react";

const App: FC = () => {
  useEffect(() => {
    console.log("Hello from the client!");
  }, []);

  return <div style={{ backgroundColor: "red" }}>REACT SSRR</div>;
};

export default App;
