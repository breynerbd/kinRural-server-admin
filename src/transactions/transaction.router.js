import { Router } from "express";
import {
  getAllTransactions,
  transfer,
  getTransactionByIdAccount,
} from "./transaction.controller.js";

import { authenticateUser } from "../../middlewares/authenticateUser.js";
import { validateCreateTransaction } from "../../middlewares/transaction-validators.js";

export const transactionRouter = Router();

// ======================================================
// GET ALL TRANSACTIONS
// ======================================================

transactionRouter.get("/", authenticateUser, getAllTransactions);

// ======================================================
// CREATE TRANSFER
// ======================================================

transactionRouter.post(
  "/",
  authenticateUser,
  validateCreateTransaction,
  transfer,
);

// ======================================================
// GET TRANSACTIONS BY ACCOUNT ID
// ======================================================

transactionRouter.get(
  "/account/:id",
  authenticateUser,
  getTransactionByIdAccount,
);
