import express, { Router, Request, Response } from "express";
import { renderHtml } from "../helpers/renderHtml";
import React from "react";
import {
  createRequestI18n,
  resolveRequestLanguage,
} from "../i18n";
import { config as serverConfig } from "../config";

interface Metatag {
  title: string;
  description: string;
  canonicalUrl?: string;
  type?: "website" | "article";
  noindex?: boolean;
  siteName?: string;
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

      const baseData =
        pageProps.data &&
        typeof pageProps.data === "object" &&
        !Array.isArray(pageProps.data)
          ? (pageProps.data as Record<string, unknown>)
          : {};
      const pageData = {
        ...baseData,
        currentPath: req.path,
      } as T;

      const htmlPageProps = { data: pageData };
      const lang = resolveRequestLanguage(req);
      const requestI18n = await createRequestI18n(lang);

      const generatedMetatag = config.generateMetatag(pageData);
      const canonicalUrl =
        generatedMetatag.canonicalUrl ??
        new URL(req.path, serverConfig.publicBaseUrl).toString();
      const metatag = {
        ...generatedMetatag,
        canonicalUrl,
        siteName: generatedMetatag.siteName ?? serverConfig.siteName,
      };

      const html = renderHtml(
        config.component,
        config.id,
        metatag,
        htmlPageProps,
        lang,
        requestI18n,
        typeof res.locals?.cspNonce === "string" ? res.locals.cspNonce : undefined
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
