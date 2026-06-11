import { Router } from "express";
import {
  getAllCards,
  getCardsByAccountId,
  approveCard,
  activateCard,
  blockCard,
} from "./card.controller.js";
import { authenticateUser } from "../../middlewares/authenticateUser.js";
import { authorizeRoles } from "../../middlewares/authorizeRoles.js";
import { ROLES } from "../constants/roles.js";

export const cardRouter = Router();

cardRouter.get(
  "/",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.MASTER_ADMIN),
  getAllCards,
);

cardRouter.get(
  "/:id",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.MASTER_ADMIN),
  getCardsByAccountId,
);

cardRouter.post(
  "/:id",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.MASTER_ADMIN),
  approveCard,
);

cardRouter.post(
  "/:id/activate",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.MASTER_ADMIN),
  activateCard,
);

cardRouter.post(
  "/:id/block",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.MASTER_ADMIN),
  blockCard,
);
