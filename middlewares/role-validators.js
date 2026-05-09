import { body, param } from "express-validator";
import { checkValidators } from "./check-validators.js";

// Validator para crear un rol
export const validateCreateRole = [
    body("nombre")
        .notEmpty().withMessage("Nombre del rol es requerido")
        .isLength({ min: 2 }).withMessage("El nombre debe tener al menos 2 caracteres"),
    checkValidators
];

// Validator para actualizar un rol (en caso de que lo uses más adelante)
export const validateUpdateRole = [
    param("id").isInt().withMessage("ID de rol inválido"),
    body("nombre").optional()
        .notEmpty().withMessage("Nombre no puede estar vacío")
        .isLength({ min: 2 }).withMessage("El nombre debe tener al menos 2 caracteres"),
    checkValidators
];

// Validator para recibir un ID de rol
export const validateRoleId = [
    param("id").isInt().withMessage("ID de rol inválido"),
    checkValidators
];