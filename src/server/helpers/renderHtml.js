import React from "react";
import ReactDOMServer from "react-dom/server";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";

export function renderHtml(Component, id, metatag, pageProps) {
  const appHtml = ReactDOMServer.renderToString(
    <I18nextProvider i18n={i18n}>
      <Component {...pageProps} />
    </I18nextProvider>
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

  return html;
}
