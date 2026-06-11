import { Router } from "express";
import {
  createMovement,
  getMovements,
  getMovementsByAccountId,
} from "./movement.controller.js";

import { authenticateUser } from "../../middlewares/authenticateUser.js";
import { authorizeRoles } from "../../middlewares/authorizeRoles.js";
import { ROLES } from "../constants/roles.js";

export const movementRouter = Router();

movementRouter.post(
  "/",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.MASTER_ADMIN),
  createMovement,
);

movementRouter.get(
  "/",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.MASTER_ADMIN),
  getMovements,
);

movementRouter.get(
  "/:account_id",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.MASTER_ADMIN),
  getMovementsByAccountId,
);
