import { Router } from "express";
import { createUser, getUsers, updateUser, deleteUser, getUserById } from "./user.controller.js";

export const userRouter = Router();

userRouter.post("/", createUser);
userRouter.get("/", getUsers);
userRouter.put("/:id", updateUser);
userRouter.delete("/:id", deleteUser);
userRouter.get("/:id", getUserById);



