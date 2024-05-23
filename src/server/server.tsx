import express from "express";
import compression from "compression";
import path from "path";
import { createDynamicRoute } from "./routing/createDynamicRoute";
import Home from "../client/pages/Home/Home";
import Ahmet from "../client/pages/Ahmet/Ahmet";
import User from "../client/pages/User/User"; // User component'ini import edin

const app = express();
const PORT = 3000;

app.use(compression());
app.use(
  "/dist",
  express.static(path.join(__dirname, "..", "..", "client", "dist"))
);

app.use(
  createDynamicRoute({
    path: "/",
    id: "Home",
    component: Home,
    generateMetatag: () => ({
      title: "Home",
      description: "Welcome to Home Page",
    }),
  })
);

app.use(
  createDynamicRoute({
    path: "/ahmet",
    id: "Ahmet",
    component: Ahmet,
    generateMetatag: () => ({ title: "Ahmet", description: "Ahmet's Page" }),
    fetchInitialData: async () => {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/todos"
      );
      const data = await response.json();
      return { data };
    },
  })
);

app.use(
  createDynamicRoute({
    path: "/user/:id",
    id: "User",
    component: User,
    generateMetatag: (data) => ({
      title: `User ${data.id}`,
      description: `Details for user ${data.id}: ${data.title}`,
    }),
    fetchInitialData: async (params) => {
      const { id } = params || {};

      const response = await fetch(
        `https://jsonplaceholder.typicode.com/todos/${id}`
      );

      const data = await response.json();

      return { data };
    },
  })
);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
