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

import { authenticateUser } from "../../middlewares/authenticateUser.js"; // ✅ de vuelta

export const userRouter = Router();

userRouter.get("/", authenticateUser, getUsers);
userRouter.get("/:id", authenticateUser, validateUserId, getUserById);
userRouter.post("/", authenticateUser, validateCreateUser, createUser);
userRouter.put("/:id", authenticateUser, validateUpdateUser, updateUser);
userRouter.delete("/:id", authenticateUser, validateUserId, deleteUser);

userRouter.post("/internal/sync-user", validateSyncUser, syncUser);
