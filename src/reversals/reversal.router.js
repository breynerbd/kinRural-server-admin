import { Router } from "express";
import { createReversal, getReversals } from "./reversal.controller.js";

import { authenticateUser } from "../../middlewares/authenticateUser.js";
import { authorizeRoles } from "../../middlewares/authorizeRoles.js";
import { ROLES } from "../constants/roles.js";

export const reversalRouter = Router();

reversalRouter.post(
  "/",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.MASTER_ADMIN),
  createReversal,
);

reversalRouter.get(
  "/",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.MASTER_ADMIN),
  getReversals,
);
