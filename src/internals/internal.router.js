import { Router } from "express";
import { syncUserFromAuth } from "./internal.controller.js";

export const internalRouter = Router();

internalRouter.post("/sync-user", syncUserFromAuth);
