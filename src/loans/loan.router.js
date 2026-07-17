import { Router } from "express";
import {
  approveLoan,
  payInstallment,
  rejectLoan,
  checkDelinquency,
  getLoans,
  getLoanById,
} from "./loan.controller.js";
import { authenticateUser } from "../../middlewares/authenticateUser.js";
import { authorizeRoles } from "../../middlewares/authorizeRoles.js";
import { ROLES } from "../constants/roles.js";

export const loanRouter = Router();

loanRouter.get("/", getLoans);

loanRouter.get("/:id", getLoanById);

loanRouter.put(
  "/approve/:id",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.MASTER_ADMIN),
  approveLoan,
);

loanRouter.put(
  "/reject/:id",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.MASTER_ADMIN),
  rejectLoan,
);

loanRouter.put("/pay/:installment_id", payInstallment);

loanRouter.post(
  "/check-mora",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.MASTER_ADMIN),
  async (req, res) => {
    await checkDelinquency();
    res.json({ success: true });
  },
);
