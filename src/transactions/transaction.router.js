import { Router } from "express";
import {
  getAllTransactions,
  transfer,
  getTransactionByIdAccount,
  deposit,
  withdraw,
} from "./transaction.controller.js";
import { authenticateUser } from "../../middlewares/authenticateUser.js";
import { authorizeRoles } from "../../middlewares/authorizeRoles.js";
import { validateCreateTransaction } from "../../middlewares/transaction-validators.js";
import { ROLES } from "../constants/roles.js";

export const transactionRouter = Router();

transactionRouter.get(
  "/",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.MASTER_ADMIN),
  getAllTransactions,
);

transactionRouter.post(
  "/",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.MASTER_ADMIN),
  validateCreateTransaction,
  transfer,
);

transactionRouter.get(
  "/account/:id",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.MASTER_ADMIN),
  getTransactionByIdAccount,
);

transactionRouter.post(
  "/deposit",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.MASTER_ADMIN),
  deposit,
);

transactionRouter.post(
  "/withdraw",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.MASTER_ADMIN),
  withdraw,
);
