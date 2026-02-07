import express from "express";
import compression from "compression";
import path from "path";
import cookieParser from "cookie-parser";
import { createDynamicRoute } from "./routing/createDynamicRoute";
import Home from "../client/pages/Home/Home";
import Ahmet from "../client/pages/Ahmet/Ahmet";
import User from "../client/pages/User/User";
import { fetchJson } from "./helpers/fetchJson";

const app = express();
const PORT = 3000;
const ONE_DAY_MS = 1000 * 60 * 60 * 24;

type Todo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

app.use(cookieParser());
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
      const data = await fetchJson<Todo[]>(
        "https://jsonplaceholder.typicode.com/todos"
      );
      return { data };
    },
    auth: async (req, res) => {
      res.cookie("token", "123456789", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: ONE_DAY_MS,
      });
      return true;
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

      const data = await fetchJson<Todo>(
        `https://jsonplaceholder.typicode.com/todos/${id}`
      );

      return { data };
    },
  })
);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
