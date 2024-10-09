import "dotenv/config";
import express from "express";
import serveStatic from "serve-static";
import { mainRouter } from "./routes/index";

const PORT = process.env.PORT || 3000;

const server = express();

// json payload limit
server.use(express.json({ limit: "5mb" }));

// serve uploaded images
server.use(serveStatic("public/uploads"));
// serve transformed images
server.use(serveStatic("public/transformed"));

server.use("/api/v1", mainRouter);

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
