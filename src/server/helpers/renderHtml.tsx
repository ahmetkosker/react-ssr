import React from "react";
import ReactDOMServer from "react-dom/server";
import { I18nextProvider } from "react-i18next";
import type { i18n as I18nInstance } from "i18next";

interface Metatag {
  title: string;
  description: string;
  canonicalUrl?: string;
  type?: "website" | "article";
  noindex?: boolean;
  siteName?: string;
}

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string): string {
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char]);
}

function serializeForInlineScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function renderHtml<T extends Record<string, unknown>>(
  Component: React.ComponentType<T>,
  id: string,
  metatag: Metatag,
  pageProps: T,
  lang: string,
  i18n: I18nInstance,
  cspNonce?: string
): string {
  const appHtml = ReactDOMServer.renderToString(
    <I18nextProvider i18n={i18n}>
      <Component {...pageProps} />
    </I18nextProvider>
  );

  const safeTitle = escapeHtml(metatag.title);
  const safeDescription = escapeHtml(metatag.description);
  const safeLang = escapeHtml(lang);
  const safeCanonicalUrl = metatag.canonicalUrl
    ? escapeHtml(metatag.canonicalUrl)
    : "";
  const safeOgType = escapeHtml(metatag.type ?? "website");
  const safeSiteName = escapeHtml(metatag.siteName ?? "React SSR");
  const serializedPageProps = serializeForInlineScript(pageProps);
  const serializedLang = serializeForInlineScript(String(lang));
  const robotsContent = metatag.noindex ? "noindex, nofollow" : "index, follow";
  const safeNonce = cspNonce ? escapeHtml(cspNonce) : "";
  const nonceAttribute = safeNonce ? ` nonce="${safeNonce}"` : "";

  const html = `
    <!DOCTYPE html>
    <html lang="${safeLang}">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${safeTitle}</title>
        <meta name="description" content="${safeDescription}">
        <meta name="robots" content="${robotsContent}">
        ${
          safeCanonicalUrl
            ? `<link rel="canonical" href="${safeCanonicalUrl}">`
            : ""
        }
        <meta property="og:title" content="${safeTitle}">
        <meta property="og:description" content="${safeDescription}">
        <meta property="og:type" content="${safeOgType}">
        <meta property="og:site_name" content="${safeSiteName}">
        ${
          safeCanonicalUrl
            ? `<meta property="og:url" content="${safeCanonicalUrl}">`
            : ""
        }
        <meta name="twitter:card" content="summary">
        <meta name="twitter:title" content="${safeTitle}">
        <meta name="twitter:description" content="${safeDescription}">
        <link rel="stylesheet" href="/dist/bundle.css">
      </head>
      <body>
        <div id="root">${appHtml}</div>
        <script${nonceAttribute}>
          window.__DATA__ = ${serializedPageProps};
          window.__LANG__ = ${serializedLang};
        </script>
        <script${nonceAttribute} src="/dist/${id}/client.js"></script>
      </body>
    </html>
  `;

  return html;
}
