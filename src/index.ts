import "dotenv/config";
import express from "express";
import { mainRouter } from "./routes/index";

const PORT = process.env.PORT || 3000;

const server = express();

server.use(express.json({ limit: "5mb" }));
server.use("/api/v1", mainRouter);

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
