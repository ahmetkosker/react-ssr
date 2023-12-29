import express, { Request, Response } from "express";
import React from "react";
import ReactDOMServer from "react-dom/server";
import App from "../src/App";

import fs from "fs";
import path from "path";

const app = express();
app.use(express.static(path.join(__dirname, "..", "dist")));

app.get("/", (req, res) => {
  const app = ReactDOMServer.renderToString(<App />);

  res.send(`
        <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8" />
                  <title>SSR App</title>
                </head>

                <body>
                  <div id="root">${app}</div>
                   <script src="bundle.js"></script>
                 </body>
              </html>
       `);
});

app.use(
  express.static(path.resolve(__dirname, ".", "dist"), { maxAge: "30d" })
);

const PORT = 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
