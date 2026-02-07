import express, { NextFunction, Request, Response } from "express";
import compression from "compression";
import path from "path";
import cookieParser from "cookie-parser";
import { createDynamicRoute } from "./routing/createDynamicRoute";
import Home from "../client/pages/Home/Home";
import Ahmet from "../client/pages/Ahmet/Ahmet";
import User from "../client/pages/User/User";
import { fetchJson } from "./helpers/fetchJson";
import { config, isProduction } from "./config";

const app = express();

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

app.get("/healthz", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    env: config.env,
    uptime: process.uptime(),
  });
});

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
      const data = await fetchJson<Todo[]>("https://jsonplaceholder.typicode.com/todos", {
        timeoutMs: config.fetchTimeoutMs,
      });
      return { data };
    },
    auth: async (req, res) => {
      res.cookie("token", "123456789", {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: config.cookieMaxAgeMs,
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
      if (typeof id !== "string") {
        throw new Error("User id is required");
      }

      const data = await fetchJson<Todo>(`https://jsonplaceholder.typicode.com/todos/${id}`, {
        timeoutMs: config.fetchTimeoutMs,
      });

      return { data };
    },
  })
);

app.use((_req: Request, res: Response) => {
  res.status(404).send("Not Found");
});

app.use(
  (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled server error:", error);
    res.status(500).send("Internal Server Error");
  }
);

app.listen(config.port, () =>
  console.log(`Server running on port ${config.port}`)
);
