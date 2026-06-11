import { Router } from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  syncUser,
} from "./user.controller.js";
import {
  validateCreateUser,
  validateUpdateUser,
  validateUserId,
  validateSyncUser,
} from "../../middlewares/user-validators.js";

import { authenticateUser } from "../../middlewares/authenticateUser.js";
import { authorizeRoles } from "../../middlewares/authorizeRoles.js";
import { ROLES } from "../constants/roles.js";

export const userRouter = Router();

userRouter.get(
  "/",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.MASTER_ADMIN),
  getUsers,
);

userRouter.get(
  "/:id",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.MASTER_ADMIN),
  validateUserId,
  getUserById,
);

userRouter.post(
  "/",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.MASTER_ADMIN),
  validateCreateUser,
  createUser,
);

userRouter.put(
  "/:id",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.MASTER_ADMIN),
  validateUpdateUser,
  updateUser,
);

userRouter.delete(
  "/:id",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.MASTER_ADMIN),
  validateUserId,
  deleteUser,
);

userRouter.post("/internal/sync-user", validateSyncUser, syncUser);
