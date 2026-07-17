import { Router } from "express";
import {
  getAllRequests,
  approveRequest,
  rejectRequest,
} from "./accountRequest.controller.js";

import { validateAccountRequestId } from "../../middlewares/accountRequest-validators.js";

import { authenticateUser } from "../../middlewares/authenticateUser.js";
import { authorizeRoles } from "../../middlewares/authorizeRoles.js";
import { ROLES } from "../constants/roles.js";

export const accountRequestRouter = Router();

accountRequestRouter.get(
  "/",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.MASTER_ADMIN),
  getAllRequests,
);

accountRequestRouter.patch(
  "/:id/approve",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.MASTER_ADMIN),
  validateAccountRequestId,
  approveRequest,
);

accountRequestRouter.patch(
  "/:id/reject",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.MASTER_ADMIN),
  validateAccountRequestId,
  rejectRequest,
);
