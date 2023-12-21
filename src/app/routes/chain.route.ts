import { Router } from "express";
import chainsController from "../controllers/chains.controller";

const router = Router();

router.get("/chains", chainsController.getAllChains);

// eventFetchRouter.get( "/base-listeners/:id",
//   eventFetchController.getEventFetchRequestById,
// );

export default router;