import express from "express";
import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

import React from "react";
import ReactDOMServer from "react-dom/server";



const app = express();


app.get("/react", (req: Request, res: Response) => {

});

const PORT = 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
