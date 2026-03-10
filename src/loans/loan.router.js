import { Router } from "express";
import { 
  approveLoan, 
  payInstallment, 
  rejectLoan, 
  checkDelinquency,
  getLoans,
  getLoanById
} from "./loan.controller.js";

export const loanRouter = Router();

loanRouter.get(
  "/",
  getLoans
);

loanRouter.get(
  "/:id",
  getLoanById
);

loanRouter.put(
  "/approve/:id",
  approveLoan
);

loanRouter.put(
  "/reject/:id",
  rejectLoan
);

loanRouter.put(
  "/pay/:installment_id",
  payInstallment
);

loanRouter.post(
  "/check-mora",
  async (req, res) => {
    await checkDelinquency();
    res.json({ success: true });
  }
);