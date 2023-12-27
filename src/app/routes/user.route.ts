import { Router } from "express";
import userController from "../controllers/user.controller";

const router = Router();

router.post("/register", async (req, res) => {
  /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Register a new user',
            schema: { $ref: '#/definitions/RegisterUser' }
    } 
  */
  await userController.registerUser(req, res);
});

export default router;
