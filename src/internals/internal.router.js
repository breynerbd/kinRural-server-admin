import { Router } from "express";
import { syncUserFromAuth } from "./internal.controller.js";
import { internalApiKey } from "../../middlewares/internalApiKey.js";

export const internalRouter = Router();

internalRouter.post("/sync-user", internalApiKey, syncUserFromAuth);
