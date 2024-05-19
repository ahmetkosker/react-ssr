// server.ts

import express from "express";
import compression from "compression";
import path from "path";
import { createDynamicRoute } from "./routing/createDynamicRoute";
import Home from "../client/pages/Home/Home";
import Homex from "../client/pages/Homex/Homex";
import React from "react";

const app = express();
const PORT = 3000;

app.use(compression());

app.use(
  "/dist",
  express.static(path.join(__dirname, "..", "..", "client", "dist"))
);

app.use(
  createDynamicRoute(
    "/",
    "Home",
    () => {
      return <Home />;
    },
    { title: "", description: "" }
  )
);

app.use(
  createDynamicRoute(
    "/about",
    "Homex",
    () => {
      return <Homex />;
    },
    { title: "", description: "" }
  )
);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
