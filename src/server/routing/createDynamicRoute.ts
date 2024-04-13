import express, { Express } from "express";
import path from "path";
import ReactDOMServer from "react-dom/server";

function createDynamicRoute(
  routePath: string,
  jsFilePath: string,
  pageComponent: any,
  pathx: any,
  app: Express,
  metatag: {
    title: string;
    description: string;
  }
) {
  app.get(routePath, async (req, res) => {
    app.use(
      "/static",
      express.static(
        path.join(__dirname, "..", "..", "client", "dist", `${pathx}`)
      )
    );

    app.use(
      "/static",
      express.static(path.join(__dirname, "..", "..", "client", "dist"))
    );

    try {
      const appHtml = ReactDOMServer.renderToString(pageComponent);
      const html = `
          <!DOCTYPE html>
          <html> 
            <head>
              <title>${metatag.title}</title>
              <meta name="description" content="${metatag.description}">
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

export { createDynamicRoute };
