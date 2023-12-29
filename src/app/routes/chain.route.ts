import { Router } from "express";
import chainsController from "../controllers/chains.controller";
import "express-async-errors";

const router = Router();

router.get("/chains", chainsController.getAllChains);

export default router;
