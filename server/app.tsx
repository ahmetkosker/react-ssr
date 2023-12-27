import express, { Request, Response } from "express";
import React from "react";
import ReactDOMServer from "react-dom/server";
import App from "../src/App";

import fs from "fs";

const app = express();

app.use(express.static("build"));

app.get("/", (req: Request, res: Response) => {
  const reactx = ReactDOMServer.renderToString(<App />);

  const indexFile = fs.readFileSync("./build/index.html", "utf8");

  const skeleton = `
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>REACT SSR</title>
  </head>
  <body>
    <div class="root">${reactx}</div>
    <script src="https://firebasestorage.googleapis.com/v0/b/react-chat-app-ebc9d.appspot.com/o/main.17b7a3a7.js?alt=media&token=87aaff16-54ed-4a67-bb70-9cbec53468aa"></script>
  </body>
</html>`;

  res.send(skeleton);
});

const PORT = 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
