import { Router } from "express";
import { getAllCards, getCardsByAccountId, approveCard, activateCard, blockCard } from "./card.controller.js";

export const cardRouter = Router();

cardRouter.get("/", getAllCards);
cardRouter.get("/:id", getCardsByAccountId);

cardRouter.post("/:id", approveCard);
cardRouter.post("/:id/activate", activateCard);
cardRouter.post("/:id/block", blockCard);
