import { Router } from "express";
import { syncUserFromAuth } from "./internal.controller.js";

const router = Router();

router.post("/sync-user", syncUserFromAuth);

export default router;