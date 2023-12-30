import express, { Request, Response } from "express";
import React from "react";
import ReactDOMServer from "react-dom/server";
import App from "../src/App";
import compression from "compression";

import path from "path";

const app = express();

app.use(compression());

app.get("/static/:fileName", (req, res: Response) => {
  const fileName = req.params.fileName;

  const filePath = path.join(__dirname, "..", "dist", fileName);

  console.log(filePath);

  res.sendFile(filePath);
});

app.get("/", async (req, res) => {
  const data = await fetch("https://jsonplaceholder.typicode.com/todos")
    .then((response) => response.json())
    .then((json) => json.slice(0, 10));

  res.write;

  const app = ReactDOMServer.renderToString(<App name="ahmet" />);

  const style = `<link rel="stylesheet" href="/static/bundle.css">`;
  const head = `<head><title>Server Side Rendering</title>${style}</head>`;
  const script = `<script src="/static/bundle.js"></script>`;
  const body = `<body><div id="root">${app}</div>${script}</body>`;
  const html = `
  <!DOCTYPE html>
  <html>
      ${head}
      ${body}
  </html>
`;

  res.send(html);
});

const PORT = 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
