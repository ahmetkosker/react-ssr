// server.js

import express from "express";
import compression from "compression";
import { createDynamicRoute } from "./routing/createDynamicRoute";

const app = express();
const PORT = 3002;

app.use(compression());

import Home from "../client/pages/Home/Home";
import User from "../client/pages/User/User";
import React from "react";
import path from "path";

app.use(
  "/dist",
  express.static(path.join(__dirname, "..", "..", "client", "dist"))
);

createDynamicRoute("/", "/index.js", () => <Home name="ahmet" />, app, {
  title: "Home",
  description: "sss",
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
