import express, { Express, Request, Response } from "express";
import eventFetchRoutes from "./routes/event-fetch.route";
import chainRoutes from "./routes/chain.route";
import swaggerRoute from "./swagger";

const app: Express = express();

app.use(express.json());

swaggerRoute(app);

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.use("/chain", chainRoutes);
app.use("/chain-event", eventFetchRoutes);

export default app;
