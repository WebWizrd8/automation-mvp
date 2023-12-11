import express, { Express, Request, Response } from "express";
import eventFetchRoutes from "./routes/event-fetch.route";
import swaggerRoute from "./swagger";

const app: Express = express();

swaggerRoute(app);

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.use("/event-fetch", eventFetchRoutes);

export default app;
