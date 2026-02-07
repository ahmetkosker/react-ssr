import express, { Router, Request, Response } from "express";
import { renderHtml } from "../helpers/renderHtml";
import React from "react";
import {
  createRequestI18n,
  DEFAULT_LANGUAGE,
  isSupportedLanguage,
} from "../i18n";

interface Metatag {
  title: string;
  description: string;
}

interface RouteConfig<T = unknown> {
  path: string;
  id: string;
  component: React.FC<{ data: T }>;
  generateMetatag: (data: T) => Metatag;
  fetchInitialData?: (params?: Record<string, unknown>) => Promise<{ data: T }>;
  auth?: (req: Request, res: Response) => boolean | Promise<boolean>;
}

function createDynamicRoute<T = unknown>(config: RouteConfig<T>): express.RequestHandler {
  const router = Router();

  const resolveLanguage = (request: Request): string => {
    const cookieLanguage = request.cookies?.lang;
    if (typeof cookieLanguage === "string" && isSupportedLanguage(cookieLanguage)) {
      return cookieLanguage;
    }

    const acceptLanguage = request.headers["accept-language"];
    if (typeof acceptLanguage !== "string") {
      return DEFAULT_LANGUAGE;
    }

    const primaryLanguage = acceptLanguage.split(",")[0]?.split("-")[0]?.trim();
    if (primaryLanguage && isSupportedLanguage(primaryLanguage)) {
      return primaryLanguage;
    }

    return DEFAULT_LANGUAGE;
  };

  router.get(config.path, async (req: Request, res: Response) => {
    try {
      if (config.auth) {
        const isAuthenticated = await config.auth(req, res);
        if (!isAuthenticated) {
          return res.status(401).send("Unauthorized");
        }
      }

      const params = { ...req.params, ...req.query };

      let pageProps: { data: T } = { data: {} as T };
      if (config.fetchInitialData) {
        pageProps = await config.fetchInitialData(params);
      }

      const lang = resolveLanguage(req);
      const requestI18n = await createRequestI18n(lang);

      const metatag = config.generateMetatag(pageProps.data);

      const html = renderHtml(
        config.component,
        config.id,
        metatag,
        pageProps,
        lang,
        requestI18n
      );

      // res.cookie("jwt", "123123123", {
      //   httpOnly: true,
      //   secure: true,
      //   sameSite: "none",
      //   maxAge: 1000 * 60 * 60 * 24,
      // });

      res.status(200).set({ "Content-Type": "text/html" }).send(html);
    } catch (error) {
      console.error("Error in dynamic route:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  return router;
}

export { createDynamicRoute };
