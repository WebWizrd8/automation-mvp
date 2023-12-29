import { Router } from "express";
import accountsController from "../controllers/accounts.controller";
import "express-async-errors";

const router = Router();

router.get("/account-factories", accountsController.getAccountFactories);

router.get("/backend-wallets", accountsController.getAllBackendWallets);

router.get(
  "/smart-account/personal-wallet/:walletAddress",
  accountsController.getSmartAccountFromPersonalWallet,
);

router.post("/smart-account", async (req, res) => {
  /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Register a new smart account',
            schema: { $ref: '#/definitions/SmartAccount' }
    } 
*/
  await accountsController.registerSmartAccount(req, res);
});

router.post("/session-key", async (req, res) => {
  /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Register Session Key',
            schema: { $ref: '#/definitions/RegisterSessionKey' }
    } 
  */
  await accountsController.registerSessionKey(req, res);
});

// eventFetchRouter.get( "/base-listeners/:id",
//   eventFetchController.getEventFetchRequestById,
// );

export default router;
