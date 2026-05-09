import { Router } from "express";
import {
    getAllRequests,
    approveRequest,
    rejectRequest
} from "./accountRequest.controller.js";

import {
    validateAccountRequestId,
    validateCreateAccountRequest
} from "../../middlewares/accountRequest-validators.js";

export const accountRequestRouter = Router();

// Listar solicitudes
accountRequestRouter.get("/", getAllRequests);

// Aprobar solicitud
accountRequestRouter.patch("/:id/approve", validateAccountRequestId, approveRequest);

// Rechazar solicitud
accountRequestRouter.patch("/:id/reject", validateAccountRequestId, rejectRequest);

// (Opcional) Si agregas endpoint para crear solicitud
// accountRequestRouter.post("/", validateCreateAccountRequest, createAccountRequest);