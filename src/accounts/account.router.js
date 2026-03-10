import { Router } from "express";
import { createAccount, getAccounts, deleteAccountById, getAccountById } from "./account.controller.js";

export const accountRouter = Router();

accountRouter.post("/", createAccount);
accountRouter.get("/", getAccounts);
accountRouter.delete("/:id", deleteAccountById);
accountRouter.get("/:id", getAccountById);
