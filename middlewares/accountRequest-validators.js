import { body, param } from "express-validator";
import { checkValidators } from "./check-validators.js";

// Validator para crear una solicitud de cuenta
export const validateCreateAccountRequest = [
    body("user_id")
        .isInt().withMessage("ID de usuario inválido"),

    body("tipo")
        .notEmpty().withMessage("Tipo de cuenta es requerido")
        .isIn(["AHORRO", "MONETARIA"]).withMessage("Tipo de cuenta inválido"),

    body("dpi")
        .notEmpty().withMessage("DPI es requerido")
        .isLength({ min: 13, max: 13 }).withMessage("DPI debe tener 13 caracteres"),

    body("fullName")
        .notEmpty().withMessage("Nombre completo es requerido")
        .isLength({ min: 3 }).withMessage("Nombre completo demasiado corto"),

    body("phone")
        .notEmpty().withMessage("Teléfono es requerido")
        .isMobilePhone("any").withMessage("Teléfono inválido"),

    body("email")
        .notEmpty().withMessage("Correo es requerido")
        .isEmail().withMessage("Correo inválido"),

    checkValidators
];

// Validator para aprobar o rechazar solicitud por ID
export const validateAccountRequestId = [
    param("id")
        .isInt().withMessage("ID de solicitud inválido"),
    checkValidators
];