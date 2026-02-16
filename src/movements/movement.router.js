import { Router } from "express";
import { createMovement, getMovements, getMovementsByAccountId } from "./movement.controller.js";

export const movementRouter = Router();

movementRouter.post("/", createMovement);
movementRouter.get("/", getMovements);
movementRouter.get("/:account_id", getMovementsByAccountId);