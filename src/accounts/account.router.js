import { Router } from "express";
import {
  createAccount,
  getAccounts,
  deleteAccountById,
  getAccountById,
} from "./account.controller.js";

import { authenticateUser } from "../../middlewares/authenticateUser.js";
import { authorizeRoles } from "../../middlewares/authorizeRoles.js";
import { ROLES } from "../constants/roles.js";

export const accountRouter = Router();

accountRouter.post(
  "/",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.MASTER_ADMIN),
  createAccount,
);

accountRouter.get(
  "/",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.MASTER_ADMIN),
  getAccounts,
);

accountRouter.get(
  "/:id",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.MASTER_ADMIN),
  getAccountById,
);

accountRouter.delete(
  "/:id",
  authenticateUser,
  authorizeRoles(ROLES.MASTER_ADMIN),
  deleteAccountById,
);
