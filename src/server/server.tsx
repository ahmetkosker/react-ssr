import express, { NextFunction, Request, Response } from "express";
import compression from "compression";
import path from "path";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import type { FC } from "react";
import { createDynamicRoute } from "./routing/createDynamicRoute";
import Home from "../client/pages/Home/Home";
import Ahmet from "../client/pages/Ahmet/Ahmet";
import User from "../client/pages/User/User";
import NotFound from "../client/pages/NotFound/NotFound";
import ErrorPage from "../client/pages/Error/ErrorPage";
import { fetchJson } from "./helpers/fetchJson";
import { HttpError } from "./errors";
import { config, isProduction } from "./config";
import { createRequestI18n, resolveRequestLanguage } from "./i18n";
import { renderHtml } from "./helpers/renderHtml";
import type {
  Todo,
  HomeRouteData,
  TodoListRouteData,
  TodoDetailRouteData,
} from "../shared/types";
// GENERATE:IMPORT

const app = express();

const STATIC_SITEMAP_PATHS = ["/", "/ahmet"];

function sendNotFoundPage(req: Request, res: Response): Promise<void> {
  return sendServerRenderedPage(req, res, {
    statusCode: 404,
    id: "NotFound",
    component: NotFound,
    metatag: {
      title: "404 | Not Found",
      description: "The requested page could not be found.",
      noindex: true,
    },
    data: {
      path: req.path,
      currentPath: req.path,
    },
  });
}

async function sendServerRenderedPage<T>(
  req: Request,
  res: Response,
  options: {
    statusCode: number;
    id: string;
    component: FC<{ data: T }>;
    metatag: {
      title: string;
      description: string;
      canonicalUrl?: string;
      type?: "website" | "article";
      noindex?: boolean;
      siteName?: string;
    };
    data: T;
  },
): Promise<void> {
  const lang = resolveRequestLanguage(req);
  const requestI18n = await createRequestI18n(lang);
  const metatag = {
    ...options.metatag,
    canonicalUrl:
      options.metatag.canonicalUrl ??
      new URL(req.path, config.publicBaseUrl).toString(),
    siteName: options.metatag.siteName ?? config.siteName,
  };
  const html = renderHtml(
    options.component,
    options.id,
    metatag,
    { data: options.data },
    lang,
    requestI18n,
    typeof res.locals?.cspNonce === "string" ? res.locals.cspNonce : undefined,
  );

  res
    .status(options.statusCode)
    .set({ "Content-Type": "text/html" })
    .send(html);
}

app.use(cookieParser());
app.use(compression());
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
    );
  });
  next();
});
app.use((_req: Request, res: Response, next: NextFunction) => {
  const nonce = crypto.randomBytes(16).toString("base64");
  res.locals.cspNonce = nonce;

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://jsonplaceholder.typicode.com",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
  ];

  if (isProduction) {
    csp.push("upgrade-insecure-requests");
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }

  res.setHeader("Content-Security-Policy", csp.join("; "));
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");

  next();
});
app.use(
  "/dist",
  express.static(path.join(__dirname, "..", "..", "client", "dist")),
);

app.get("/robots.txt", (_req: Request, res: Response) => {
  const content = [
    "User-agent: *",
    "Allow: /",
    `Sitemap: ${config.publicBaseUrl}/sitemap.xml`,
  ].join("\n");

  res.status(200).type("text/plain").send(content);
});

app.get("/sitemap.xml", (_req: Request, res: Response) => {
  const urlEntries = STATIC_SITEMAP_PATHS.map((pathName) => {
    const url = new URL(pathName, config.publicBaseUrl).toString();
    return `<url><loc>${url}</loc></url>`;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlEntries}</urlset>`;

  res.status(200).type("application/xml").send(xml);
});

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
  }),
);

app.use(
  createDynamicRoute<TodoListRouteData>({
    path: "/ahmet",
    id: "Ahmet",
    component: Ahmet,
    generateMetatag: () => ({ title: "Todos", description: "Todo list page" }),
    fetchInitialData: async () => {
      const data = await fetchJson<Todo[]>(
        "https://jsonplaceholder.typicode.com/todos",
        {
          timeoutMs: config.fetchTimeoutMs,
        },
      );
      return { data: { todos: data } };
    },
  }),
);

app.use(
  createDynamicRoute<TodoDetailRouteData>({
    path: "/user/:id",
    id: "User",
    component: User,
    generateMetatag: (data) => ({
      title: `Todo ${data.todo.id}`,
      description: `Details for todo ${data.todo.id}: ${data.todo.title}`,
    }),
    fetchInitialData: async (params) => {
      const { id } = params || {};
      if (typeof id !== "string" || !/^\d+$/.test(id)) {
        throw new HttpError(400, "A valid numeric todo id is required");
      }

      const data = await fetchJson<Todo>(
        `https://jsonplaceholder.typicode.com/todos/${id}`,
        {
          timeoutMs: config.fetchTimeoutMs,
        },
      );

      return { data: { todo: data } };
    },
  }),
);

// GENERATE:ROUTE
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    next();
    return;
  }

  void sendNotFoundPage(req, res).catch((error) => {
    console.error("404 rendering error:", error);
    res.status(404).send("Not Found");
  });
});

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled server error:", error);
  if (res.headersSent) {
    next(error);
    return;
  }

  const status = error instanceof HttpError ? error.status : 500;
  const message = error instanceof Error ? error.message : "Unknown error";

  if (status === 404) {
    void sendNotFoundPage(req, res).catch((renderError) => {
      console.error("404 rendering error:", renderError);
      res.status(404).send("Not Found");
    });
    return;
  }

  void sendServerRenderedPage(req, res, {
    statusCode: status,
    id: "Error",
    component: ErrorPage,
    metatag: {
      title: `${status} | Server Error`,
      description: "An unexpected server error occurred.",
      noindex: true,
    },
    data: {
      message,
      currentPath: req.path,
    },
  }).catch((renderError) => {
    console.error(`${status} rendering error:`, renderError);
    res.status(status).send("Internal Server Error");
  });
});

const server = app.listen(config.port, () =>
  console.log(`Server running on port ${config.port}`),
);

function shutdown(signal: string) {
  console.log(`${signal} received, shutting down gracefully`);
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
