import { Router } from "express";
import { createRole, getRoles, deleteRole } from "./role.controller.js";
import { validateCreateRole, validateRoleId } from "../../middlewares/role-validators.js";

export const roleRouter = Router();

roleRouter.post("/", validateCreateRole, createRole);
roleRouter.get("/", getRoles);
roleRouter.delete("/:id", validateRoleId, deleteRole);