import express, { Express, Request, Response } from "express";
import eventFetchRoutes from "./routes/event-fetch.route";
import chainRoutes from "./routes/chain.route";
import swaggerRoute from "./swagger";
import { initEngine, stopEngine } from "../engine";

const app: Express = express();

app.use(express.json());

swaggerRoute(app);

initEngine().catch((err) => {
  console.log(err);
  process.exit(1);
});

app.get("/", (_req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.use("/chain", chainRoutes);
app.use("/chain-event", eventFetchRoutes);

export default app;

//eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function stopApp(_server: any) {
  await stopEngine();
}
