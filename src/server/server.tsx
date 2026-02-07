import express, { NextFunction, Request, Response } from "express";
import compression from "compression";
import path from "path";
import cookieParser from "cookie-parser";
import type { FC } from "react";
import { createDynamicRoute } from "./routing/createDynamicRoute";
import Home from "../client/pages/Home/Home";
import Ahmet from "../client/pages/Ahmet/Ahmet";
import User from "../client/pages/User/User";
import NotFound from "../client/pages/NotFound/NotFound";
import ErrorPage from "../client/pages/Error/ErrorPage";
import { fetchJson } from "./helpers/fetchJson";
import { config, isProduction } from "./config";
import { createRequestI18n, resolveRequestLanguage } from "./i18n";
import { renderHtml } from "./helpers/renderHtml";

const app = express();

type Todo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

interface HomeRouteData {
  currentPath?: string;
}

interface AhmetRouteData {
  users: Todo[];
  currentPath?: string;
}

interface UserRouteData {
  user: Todo;
  currentPath?: string;
}

async function sendServerRenderedPage<T>(
  req: Request,
  res: Response,
  options: {
    statusCode: number;
    id: string;
    component: FC<{ data: T }>;
    metatag: { title: string; description: string };
    data: T;
  }
): Promise<void> {
  const lang = resolveRequestLanguage(req);
  const requestI18n = await createRequestI18n(lang);
  const html = renderHtml(
    options.component,
    options.id,
    options.metatag,
    { data: options.data },
    lang,
    requestI18n
  );

  res.status(options.statusCode).set({ "Content-Type": "text/html" }).send(html);
}

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
  createDynamicRoute<HomeRouteData>({
    path: "/",
    id: "Home",
    component: Home,
    generateMetatag: (_data) => ({
      title: "Home",
      description: "Welcome to Home Page",
    }),
  })
);

app.use(
  createDynamicRoute<AhmetRouteData>({
    path: "/ahmet",
    id: "Ahmet",
    component: Ahmet,
    generateMetatag: () => ({ title: "Todos", description: "Todo list page" }),
    fetchInitialData: async () => {
      const data = await fetchJson<Todo[]>("https://jsonplaceholder.typicode.com/todos", {
        timeoutMs: config.fetchTimeoutMs,
      });
      return { data: { users: data } };
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
  createDynamicRoute<UserRouteData>({
    path: "/user/:id",
    id: "User",
    component: User,
    generateMetatag: (data) => ({
      title: `Todo ${data.user.id}`,
      description: `Details for todo ${data.user.id}: ${data.user.title}`,
    }),
    fetchInitialData: async (params) => {
      const { id } = params || {};
      if (typeof id !== "string") {
        throw new Error("User id is required");
      }

      const data = await fetchJson<Todo>(`https://jsonplaceholder.typicode.com/todos/${id}`, {
        timeoutMs: config.fetchTimeoutMs,
      });

      return { data: { user: data } };
    },
  })
);

app.use((req: Request, res: Response) => {
  void sendServerRenderedPage(req, res, {
    statusCode: 404,
    id: "NotFound",
    component: NotFound,
    metatag: {
      title: "404 | Not Found",
      description: "The requested page could not be found.",
    },
    data: {
      path: req.path,
      currentPath: req.path,
    },
  }).catch((error) => {
    console.error("404 rendering error:", error);
    res.status(404).send("Not Found");
  });
});

app.use(
  (error: unknown, req: Request, res: Response, next: NextFunction) => {
    console.error("Unhandled server error:", error);
    if (res.headersSent) {
      next(error);
      return;
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    void sendServerRenderedPage(req, res, {
      statusCode: 500,
      id: "Error",
      component: ErrorPage,
      metatag: {
        title: "500 | Server Error",
        description: "An unexpected server error occurred.",
      },
      data: {
        message,
        currentPath: req.path,
      },
    }).catch((renderError) => {
      console.error("500 rendering error:", renderError);
      res.status(500).send("Internal Server Error");
    });
  }
);

app.listen(config.port, () =>
  console.log(`Server running on port ${config.port}`)
);
