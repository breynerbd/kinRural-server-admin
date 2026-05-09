import { body, param } from "express-validator";
import { checkValidators } from "./check-validators.js";

// Validación al crear una tarjeta
export const validateCreateCard = [
    body("account_id")
        .isInt({ min: 1 }).withMessage("ID de cuenta inválido"),

    body("tipo")
        .isIn(["DEBITO", "CREDITO"]).withMessage("Tipo de tarjeta inválido"),

    body("numero_tarjeta")
        .isCreditCard().withMessage("Número de tarjeta inválido"),

    body("cvv")
        .isLength({ min: 3, max: 4 }).withMessage("CVV inválido"),

    body("fecha_expiracion")
        .isDate({ format: "YYYY-MM-DD" }).withMessage("Fecha de expiración inválida"),

    body("limite_credito")
        .optional()
        .isFloat({ min: 0 }).withMessage("Límite de crédito inválido"),

    checkValidators
];

// Validación para aprobar o rechazar tarjeta
export const validateApproveCard = [
    param("id").isInt({ min: 1 }).withMessage("ID de tarjeta inválido"),

    body("action")
        .isIn(["APROBADA", "RECHAZADA"])
        .withMessage("Acción debe ser 'APROBADA' o 'RECHAZADA'"),

    checkValidators
];

// Validación para activar tarjeta
export const validateActivateCard = [
    param("id").isInt({ min: 1 }).withMessage("ID de tarjeta inválido"),
    checkValidators
];

// Validación para bloquear tarjeta
export const validateBlockCard = [
    param("id").isInt({ min: 1 }).withMessage("ID de tarjeta inválido"),
    checkValidators
];

// Validación para obtener tarjetas por ID de cuenta
export const validateGetCardsByAccountId = [
    param("id").isInt({ min: 1 }).withMessage("ID de cuenta inválido"),
    checkValidators
];