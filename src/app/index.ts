import express, { Express, Request, Response } from "express";
import eventFetchRoutes from "./routes/event-fetch.route";
import chainRoutes from "./routes/chain.route";
import accountRoutes from "./routes/account.route";
import userRoutes from "./routes/user.route";
import destinationRoutes from "./routes/destination.route";
import swaggerRoute from "./swagger";
import { initEngine, stopEngine } from "../engine";
import { errorHandler } from "./middlewares";
import "express-async-errors";

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
app.use("/account", accountRoutes);
app.use("/chain-event", eventFetchRoutes);
app.use("/user", userRoutes);
app.use("/destination", destinationRoutes);

app.use(errorHandler);

export default app;

//eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function stopApp(_server: any) {
  await stopEngine();
}
