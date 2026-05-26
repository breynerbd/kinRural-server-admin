import { body, param } from "express-validator";
import { checkValidators } from "./check-validators.js";

export const validateCreateUser = [
  body("nombre")
    .notEmpty()
    .withMessage("Nombre requerido")
    .isLength({ min: 2 }),

  body("apellido").notEmpty().withMessage("Apellido requerido"),

  body("dpi")
    .notEmpty()
    .withMessage("DPI requerido")
    .matches(/^[0-9]{13}$/)
    .withMessage("DPI inválido"),

  body("correo").isEmail().withMessage("Correo inválido"),

  body("telefono").notEmpty().withMessage("Teléfono requerido"),

  body("direccion").notEmpty().withMessage("Dirección requerida"),

  body("ingresos_mensuales")
    .isFloat({ min: 100 })
    .withMessage("Ingresos mínimos Q100"),

  // 👇 CAMBIO IMPORTANTE
  body("role")
    .notEmpty()
    .withMessage("Rol requerido")
    .isIn(["ADMIN", "USER"])
    .withMessage("Rol inválido"),

  body("username").notEmpty(),

  body("password").isLength({ min: 6 }),

  checkValidators,
];

export const validateUpdateUser = [
  param("id").isInt(),

  body("correo").optional().isEmail(),

  body("ingresos_mensuales").optional().isFloat({ min: 100 }),

  // 👇 también aquí
  body("role").optional().isIn(["ADMIN", "USER"]).withMessage("Rol inválido"),

  checkValidators,
];

export const validateUserId = [param("id").isInt(), checkValidators];
