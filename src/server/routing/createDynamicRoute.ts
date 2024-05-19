// routing/createDynamicRoute.ts

import express, { Router, Request, Response, NextFunction } from "express";
import ReactDOMServer from "react-dom/server";

interface Metatag {
  title: string;
  description: string;
}

function createDynamicRoute(
  routePath: string,
  id: string,
  getPageComponent: () => any,
  metatag: Metatag
): express.RequestHandler {
  const router = Router();

  router.get(
    routePath,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const appHtml = ReactDOMServer.renderToString(getPageComponent());
        const html = `
      <!DOCTYPE html>
      <html> 
        <head>
          <title>${metatag.title}</title>
          <meta name="description" content="${metatag.description}">
          <link rel="stylesheet" href="/dist/bundle.css">
        </head>
        <body>
          <div id="root">${appHtml}</div> 
          <script src="/dist/${id}/client.js"></script>
        </body>
      </html>
    `;

        res.cookie("asd", "asdasd");
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (error) {
        console.error("Error rendering page:", error);
        res.status(500).send("Internal Server Error");
      }
    }
  );

  return router;
}

export { createDynamicRoute };
