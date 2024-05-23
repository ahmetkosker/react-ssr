import React, { ReactElement } from "react";
import ReactDOMServer from "react-dom/server";

interface Metatag {
  title: string;
  description: string;
}

export function renderHtml(
  Component: React.ComponentType<any>,
  id: string,
  metatag: Metatag,
  pageProps: any
): string {
  const appHtml = ReactDOMServer.renderToString(
    React.createElement(Component, pageProps)
  );
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
        <script>
          window.__DATA__ = ${JSON.stringify(pageProps)};
        </script>
        <script src="/dist/${id}/client.js"></script>
      </body>
    </html>
  `;

  console.log("Generated HTML:", html); 
  return html;
}
