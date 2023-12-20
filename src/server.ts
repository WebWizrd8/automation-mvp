import dotenv from "dotenv";
import app, { stopApp } from "./app";
import { getLogger } from "./utils/logger";

dotenv.config();

const logger = getLogger("server");

const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

process.on("SIGTERM", () => {
  logger.debug("SIGTERM signal received: closing HTTP server");
  server.close(async () => {
    await stopApp(server);
    logger.debug("HTTP server closed");
  });
});
