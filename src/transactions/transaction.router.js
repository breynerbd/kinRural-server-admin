import { Router } from "express";
import { getAllTransactions, transfer, getTransactionByIdAccount } from "./transaction.controller.js";

export const transactionRouter = Router();

transactionRouter.get("/", getAllTransactions);
transactionRouter.post("/", transfer);
transactionRouter.get("/:id", getTransactionByIdAccount);
