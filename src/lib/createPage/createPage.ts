import express from "express";

const app = express();

const createPage = ({ path }: { path: string }) => {
  app.use(path, () => {
    console.log(path);
  });
};

export { createPage };
