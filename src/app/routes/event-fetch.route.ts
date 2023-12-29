import { Router } from "express";
import * as eventFetchController from "../controllers/event-fetch.controller";
import "express-async-errors";

const eventFetchRouter = Router();

eventFetchRouter.get(
  "/tags/:chainId",
  eventFetchController.getEventFetchTagsByChainId,
);

eventFetchRouter.get("/tags", eventFetchController.getAllEventFetchTags);

eventFetchRouter.get(
  "/base-listeners/functions",
  eventFetchController.getEventFetchRequestFunctions,
);

eventFetchRouter.get(
  "/base-listeners/triggers/:id",
  eventFetchController.getEventFetchRequestFunctionById,
);

eventFetchRouter.get(
  "/base-listeners/trigger-with-actions/id/:id",
  eventFetchController.getEventFetchRequestFunctionForIdWithActions,
);

eventFetchRouter.get(
  "/base-listeners/trigger-with-actions/user/:userId",
  eventFetchController.getAllEventFetchRequestFunctionsWithActionsByUserId,
);

eventFetchRouter.post(
  "/base-listeners/trigger-with-actions/create",
  async (req, res) => {
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Add a new trigger with actions',
            schema: { $ref: '#/definitions/EventFetchRequest' }
    } 
*/
    return await eventFetchController.createEventFetchRequestFunctionWithActions(
      req,
      res,
    );
  },
);

eventFetchRouter.post(
  "/base-listeners/trigger-with-actions/update/:id",
  async (req, res) => {
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Update a trigger with actions',
            schema: { $ref: '#/definitions/EventFetchRequest' }
    } 
*/
    return await eventFetchController.updateEventFetchRequestFunctionWithActions(
      req,
      res,
    );
  },
);

eventFetchRouter.delete(
  "/base-listeners/trigger-with-actions/delete/:id",
  eventFetchController.deleteEventFetchRequestFunctionWithActions,
);

eventFetchRouter.get(
  "/base-listeners/:id",
  eventFetchController.getEventFetchRequestById,
);

eventFetchRouter.get(
  "/base-listeners",
  eventFetchController.getAllEventFetchRequests,
);

export default eventFetchRouter;
