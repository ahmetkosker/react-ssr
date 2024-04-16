// routing/createDynamicRoute.js

import express, { Express, Router } from "express";
import path from "path";
import ReactDOMServer from "react-dom/server";

function createDynamicRoute(
  routePath: string,
  jsFilePath: string,
  getPageComponent: () => JSX.Element,
  app: Express,
  metatag: {
    title: string;
    description: string;
  }
) {
  const router = Router();

  app.use(routePath, async (req, res) => {
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
              <script src="/dist/Home${jsFilePath}"></script>
            </body>
          </html>
        `;

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (error) {
      console.error("Error rendering page:", error);

      res.status(500).send("Internal Server Error");
    }
  });
}

export { createDynamicRoute };
