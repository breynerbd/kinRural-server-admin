import { Router } from "express";
import { createReversal, getReversals } from "./reversal.controller.js";

export const reversalRouter = Router();

reversalRouter.post("/", createReversal);
reversalRouter.get("/", getReversals);