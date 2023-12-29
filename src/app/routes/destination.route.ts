import { Router } from "express";
import destinationController from "../controllers/destination.controller";
import "express-async-errors";

const router = Router();

router.get(
  "/destination-config-schema/:destinationType/:subType?",
  destinationController.getDestinationConfigSchema,
);

export default router;
