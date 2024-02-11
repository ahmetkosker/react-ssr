import express, { Request, Response } from "express";
import React from "react";
import ReactDOMServer from "react-dom/server";
import compression from "compression";

import path from "path";
import About from "../src/pages/About/About";
import Home from "../src/pages/Home/Home";
import User from "../src/pages/User/User";

const app = express();

app.use(compression());

app.get("/static/:fileName", (req, res: Response) => {
  const fileName = req.params.fileName;

  const filePath = path.join(__dirname, "..", "dist", "Home", fileName);
  console.log(filePath);
  res.sendFile(filePath);
});

app.get("/static/About/:fileName", (req, res: Response) => {
  const fileName = req.params.fileName;

  const filePath = path.join(__dirname, "..", "dist", "About", fileName);
  console.log(filePath);
  res.sendFile(filePath);
});

app.get("/static/User/:fileName", (req, res: Response) => {
  const fileName = req.params.fileName;

  const filePath = path.join(__dirname, "..", "dist", "User", fileName);
  console.log(filePath);
  res.sendFile(filePath);
});

app.get("/about", async (req, res) => {
  const app = ReactDOMServer.renderToString(<About />);

  const style = `<link rel="stylesheet" href="/static/bundle.css">`;
  const head = `<head><title>About</title><meta name="description" content="About">
  ${style}</head>`;
  const script = `<script src="/static/About/index.js"></script>`;
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

app.get("/user/:id", async (req, res) => {
  const id = req.params.id;

  const user = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`)
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error fetching user data:", error);
      return null;
    });

  if (!user) {
    res.status(500).send("Error loading user data");
    return;
  }

  const app = ReactDOMServer.renderToString(<User user={user} />);

  const scriptWithId = `<script>window.__USER__ = ${JSON.stringify(
    user
  )};</script>`;

  const style = `<link rel="stylesheet" href="/static/bundle.css">`;
  const head = `<head><title>User</title><meta name="description" content="User">
  ${style}</head>`;

  const script = `<script src="/static/User/index.js"></script>`;
  const body = `<body><div id="root">${app}</div>${scriptWithId}${script}</body>`;

  const html = `
  <!DOCTYPE html>
  <html>
      ${head}
      ${body}
  </html>
  `;

  res.send(html);
});

app.get("*", async (req, res) => {
  const app = ReactDOMServer.renderToString(<Home name="ahmet" />);

  const style = `<link rel="stylesheet" href="/static/bundle.css">`;
  const head = `<head><title>Home</title>
  <meta name="description" content="Homepage">
  ${style}</head>`;
  const script = `<script src="/static/index.js"></script>`;
  const body = `<body><div id="root">${app}</div>${script}</body>`;
  const html = `
  <!DOCTYPE html>
  <html>
      ${head}
      ${body}
  </html>
`;

  console.log(html);

  res.send(html);
});

const PORT = 3001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
