import { Router } from "express";
import { createRole, getRoles, deleteRole } from "./role.controller.js";

export const roleRouter = Router();

roleRouter.post("/", createRole);
roleRouter.get("/", getRoles);
roleRouter.delete("/:id", deleteRole);
