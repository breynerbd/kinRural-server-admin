import { Router } from "express";
import {
    getAllRequests,
    approveRequest,
    rejectRequest
} from "./accountRequest.controller.js";

export const accountRequestRouter = Router();

accountRequestRouter.get("/", getAllRequests);
accountRequestRouter.patch("/:id/approve", approveRequest);
accountRequestRouter.patch("/:id/reject", rejectRequest);
