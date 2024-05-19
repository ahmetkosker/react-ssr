import React, { useEffect, useState } from "react";

const Home = () => {
  const colors = [
    "text-red-500",
    "text-blue-500",
    "text-green-500",
    "text-yellow-500",
    "text-pink-500",
    "text-purple-500",
    "text-indigo-500",
    "text-gray-500",
    "text-black",
  ];

  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [vertical, setVertical] = useState(0);
  const [horizontal, setHorizontal] = useState(0);

  useEffect(() => {
    const keyboardListener = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          setVertical((prev) => prev - 150);
          break;
        case "ArrowDown":
          setVertical((prev) => prev + 150);
          break;
        case "ArrowLeft":
          setHorizontal((prev) => prev - 150);

          break;
        case "ArrowRight":
          setHorizontal((prev) => prev + 150);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", keyboardListener);

    return () => window.removeEventListener("keydown", keyboardListener);

    // const colorChanger = setInterval(() => {
    //   const randomColor = colors[Math.floor(Math.random() * colors.length)];
    //   setSelectedColor(randomColor);
    // }, 1000);

    // return () => clearInterval(colorChanger);
  }, []);

  return (
    <div className="w-screen h-screen relative">
      <div
        style={{ position: "absolute", top: vertical, left: horizontal }}
        className={`${selectedColor} w-44 h-32 transition-all duration-500`}
      >
        press an arrow key
      </div>
    </div>
  );
};

export default Home;
