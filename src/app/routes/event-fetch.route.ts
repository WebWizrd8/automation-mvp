import { Router } from "express";
import eventFetchController from "../controllers/event-fetch.controller";

const eventFetchRouter = Router();

eventFetchRouter.get("/", eventFetchController.getEventFetchRequests);

export default eventFetchRouter;
