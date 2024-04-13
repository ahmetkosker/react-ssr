import express, { Request, Response } from "express";
import React from "react";
import compression from "compression";
import { createDynamicRoute } from "./routing/createDynamicRoute";

const app = express();

app.use(compression());

import About from "../client/pages/About/About";
import Home from "../client/pages/Home/Home";
import User from "../client/pages/User/User";

createDynamicRoute(
  "/about",
  "/static/About/index.js",
  <About />,
  "About",
  app,
  { title: "About", description: "This is a about page" }
);
createDynamicRoute(
  "/user/:id",
  "/static/User/index.js",
  <User />,
  "User",
  app,
  { title: "User", description: "" }
);
createDynamicRoute(
  "/",
  "/static/index.js",
  <Home name="ahmet" />,
  "Home",
  app,
  { title: "Home", description: "sss" }
);

const PORT = 3002;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
