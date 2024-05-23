import express, { Router, Request, Response } from "express";
import React from "react";
import { renderHtml } from "../helpers/renderHtml";

interface Metatag {
  title: string;
  description: string;
}

interface RouteConfig {
  path: string;
  id: string;
  component: React.ComponentType<any>;
  generateMetatag: (data: any) => Metatag;
  fetchInitialData?: (params?: Record<string, any>) => Promise<any>;
}

function createDynamicRoute(config: RouteConfig): express.RequestHandler {
  const router = Router();

  router.get(config.path, async (req: Request, res: Response) => {
    try {
      const params = { ...req.params, ...req.query };
      let pageProps: any = {}; 
      if (config.fetchInitialData) {
        pageProps = await config.fetchInitialData(params);
      }
      const metatag = config.generateMetatag(pageProps.data);
      const html = renderHtml(
        config.component,
        config.id,
        metatag,
        pageProps
      );
      res.status(200).set({ "Content-Type": "text/html" }).send(html);
    } catch (error) {
      console.error("Error in dynamic route:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  return router;
}

export { createDynamicRoute };
