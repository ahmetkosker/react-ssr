import React from "react";
import ReactDOMServer from "react-dom/server";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";

const HTML_ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char]);
}

function serializeForInlineScript(value) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function renderHtml(Component, id, metatag, pageProps, lang) {
  const appHtml = ReactDOMServer.renderToString(
    <I18nextProvider i18n={i18n}>
      <Component {...pageProps} />
    </I18nextProvider>
  );

  const safeTitle = escapeHtml(metatag.title);
  const safeDescription = escapeHtml(metatag.description);
  const serializedPageProps = serializeForInlineScript(pageProps);
  const serializedLang = serializeForInlineScript(String(lang));

  const html = `
    <!DOCTYPE html>
    <html> 
      <head>
        <title>${safeTitle}</title>
        <meta name="description" content="${safeDescription}">
        <link rel="stylesheet" href="/dist/bundle.css">
      </head>
      <body>
        <div id="root">${appHtml}</div> 
        <script>
          window.__DATA__ = ${serializedPageProps};
          window.__LANG__ = ${serializedLang};
        </script>
        <script src="/dist/${id}/client.js"></script>
      </body>
    </html>
  `;

  return html;
}
