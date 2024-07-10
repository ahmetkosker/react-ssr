import express, { Router, Request, Response } from "express";
import { renderHtml } from "../helpers/renderHtml";
import React from "react";
import i18n from "../i18n";

interface Metatag {
  title: string;
  description: string;
}

interface RouteConfig {
  path: string;
  id: string;
  component: React.FC<any>;
  generateMetatag: (data: any) => Metatag;
  fetchInitialData?: (params?: Record<string, any>) => Promise<any>;
  auth?: (req: Request, res: Response) => boolean | Promise<boolean>;
}

let supportedLangs = ["fr", "en"];

function createDynamicRoute(config: RouteConfig): express.RequestHandler {
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

      let pageProps: any = {};
      if (config.fetchInitialData) {
        pageProps = await config.fetchInitialData(params);
      }

      const lang = req.cookies.lang
        ? req.cookies.lang
        : supportedLangs.includes(
            req.headers["accept-language"]?.split("-")[0] as string
          )
        ? req.headers["accept-language"]?.split("-")[0]
        : "en";

      await i18n.changeLanguage(lang);

      const metatag = config.generateMetatag(pageProps.data);

      const html = renderHtml(config.component, config.id, metatag, pageProps);

      res.cookie("jwt", "123123123", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24,
      });

      res.cookie("lang", lang);

      res.status(200).set({ "Content-Type": "text/html" }).send(html);
    } catch (error) {
      console.error("Error in dynamic route:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  return router;
}

export { createDynamicRoute };
