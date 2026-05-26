import { Router } from "express";
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  getUserById,
  syncUser,
} from "./user.controller.js";

import {
  validateCreateUser,
  validateUpdateUser,
  validateUserId,
} from "../../middlewares/user-validators.js";

export const userRouter = Router();

userRouter.get("/", getUsers);

userRouter.get("/:id", validateUserId, getUserById);

userRouter.post("/", validateCreateUser, createUser);

userRouter.put("/:id", validateUpdateUser, updateUser);

userRouter.delete("/:id", validateUserId, deleteUser);

userRouter.post("/internal/sync-user", syncUser);
