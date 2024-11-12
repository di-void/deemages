import "dotenv/config";
import express from "express";
import { mainRouter } from "./routes/index.js";
import { PORT, API_VERSION } from "./config/index.js";

const server = express();

// json payload limit
server.use(express.json({ limit: "5mb" }));

server.use(`/api/${API_VERSION}`, mainRouter);

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
