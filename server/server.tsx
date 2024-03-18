import express, { Request, Response } from "express";
import React from "react";
import ReactDOMServer from "react-dom/server";
import compression from "compression";

import path from "path";

const app = express();

app.use(compression());

function createDynamicRoute(
  routePath: string,
  jsFilePath: string,
  pageComponent: any,
  pathx: any
) {
  app.get(routePath, async (req, res) => {
    app.use(
      "/static",
      express.static(path.join(__dirname, "..", "dist", `${pathx}`))
    );
    try {
      const appHtml = ReactDOMServer.renderToString(pageComponent);

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${routePath}</title>
            <meta name="description" content="${routePath}">
            <link rel="stylesheet" href="/static/bundle.css">
          </head>
          <body>
            <div id="root">${appHtml}</div>
            <script src="${jsFilePath}"></script>
          </body>
        </html>
      `;

      res.send(html);
    } catch (error) {
      console.error("Error rendering page:", error);
      res.status(500).send("Internal Server Error");
    }
  });
}

import About from "../src/pages/About/About";
import Home from "../src/pages/Home/Home";
import User from "../src/pages/User/User";

createDynamicRoute("/about", "/static/About/index.js", <About />, "About");
createDynamicRoute("/user/:id", "/static/User/index.js", <User />, "User");
createDynamicRoute("/", "/static/index.js", <Home name="ahmet" />, "Home");

const PORT = 3001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
