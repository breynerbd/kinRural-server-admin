import { body, param } from "express-validator";
import { User } from "../src/users/user.model.js";
import { checkValidators } from "./check-validators.js";

// ======================================================
// CONSTANTS
// ======================================================

const validRoles = ["USER", "ADMIN", "MASTER_ADMIN"];

// ======================================================
// CREATE USER VALIDATOR
// ======================================================

export const validateCreateUser = [
  // ======================================================
  // NOMBRE
  // ======================================================

  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio.")
    .isLength({ min: 2, max: 50 })
    .withMessage("El nombre debe tener entre 2 y 50 caracteres."),

  // ======================================================
  // APELLIDO
  // ======================================================

  body("apellido")
    .trim()
    .notEmpty()
    .withMessage("El apellido es obligatorio.")
    .isLength({ min: 2, max: 50 })
    .withMessage("El apellido debe tener entre 2 y 50 caracteres."),

  // ======================================================
  // DPI
  // ======================================================

  body("dpi")
    .notEmpty()
    .withMessage("El DPI es obligatorio.")
    .matches(/^[0-9]{13}$/)
    .withMessage("El DPI debe tener 13 dígitos.")
    .custom(async (dpi) => {
      const existingDpi = await User.findOne({
        where: { dpi },
      });

      if (existingDpi) {
        throw new Error("Ya existe un usuario con ese DPI.");
      }

      return true;
    }),

  // ======================================================
  // CORREO
  // ======================================================

  body("correo")
    .trim()
    .notEmpty()
    .withMessage("El correo es obligatorio.")
    .isEmail()
    .withMessage("Correo inválido.")
    .custom(async (correo) => {
      const existingCorreo = await User.findOne({
        where: { correo },
      });

      if (existingCorreo) {
        throw new Error("Ya existe un usuario con ese correo.");
      }

      return true;
    }),

  // ======================================================
  // TELÉFONO
  // ======================================================

  body("telefono")
    .trim()
    .notEmpty()
    .withMessage("El teléfono es obligatorio.")
    .isLength({ min: 8, max: 20 })
    .withMessage("Teléfono inválido."),

  // ======================================================
  // DIRECCIÓN
  // ======================================================

  body("direccion")
    .trim()
    .notEmpty()
    .withMessage("La dirección es obligatoria.")
    .isLength({ min: 5, max: 255 })
    .withMessage("Dirección inválida."),

  // ======================================================
  // INGRESOS
  // ======================================================

  body("ingresos_mensuales")
    .notEmpty()
    .withMessage("Los ingresos mensuales son obligatorios.")
    .isFloat({ min: 100 })
    .withMessage("Ingresos mínimos Q100."),

  // ======================================================
  // ROLE
  // ======================================================

  body("role")
    .trim()
    .notEmpty()
    .withMessage("El rol es obligatorio.")
    .isIn(validRoles)
    .withMessage("Rol inválido."),

  // ======================================================
  // USERNAME
  // ======================================================

  body("username")
    .trim()
    .notEmpty()
    .withMessage("El username es obligatorio.")
    .isLength({ min: 3, max: 30 })
    .withMessage("El username debe tener entre 3 y 30 caracteres."),

  // ======================================================
  // PASSWORD
  // ======================================================

  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria.")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener mínimo 8 caracteres."),

  // ======================================================
  // VALIDATION RESULT
  // ======================================================

  checkValidators,
];

// ======================================================
// UPDATE USER VALIDATOR
// ======================================================

export const validateUpdateUser = [
  // ======================================================
  // PARAM ID
  // ======================================================

  param("id").isInt({ min: 1 }).withMessage("ID inválido."),

  // ======================================================
  // NOMBRE
  // ======================================================

  body("nombre")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("El nombre debe tener entre 2 y 50 caracteres."),

  // ======================================================
  // APELLIDO
  // ======================================================

  body("apellido")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("El apellido debe tener entre 2 y 50 caracteres."),

  // ======================================================
  // CORREO
  // ======================================================

  body("correo").optional().trim().isEmail().withMessage("Correo inválido."),

  // ======================================================
  // TELÉFONO
  // ======================================================

  body("telefono")
    .optional()
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage("Teléfono inválido."),

  // ======================================================
  // DIRECCIÓN
  // ======================================================

  body("direccion")
    .optional()
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage("Dirección inválida."),

  // ======================================================
  // INGRESOS
  // ======================================================

  body("ingresos_mensuales")
    .optional()
    .isFloat({ min: 100 })
    .withMessage("Ingresos mínimos Q100."),

  // ======================================================
  // ROLE
  // ======================================================

  body("role").optional().trim().isIn(validRoles).withMessage("Rol inválido."),

  // ======================================================
  // VALIDATION RESULT
  // ======================================================

  checkValidators,
];

// ======================================================
// USER ID VALIDATOR
// ======================================================

export const validateUserId = [
  param("id").isInt({ min: 1 }).withMessage("ID inválido."),

  checkValidators,
];

// ======================================================
// INTERNAL SYNC USER VALIDATOR
// ======================================================

export const validateSyncUser = [
  body("auth_id").notEmpty().withMessage("auth_id es obligatorio."),

  body("nombre").trim().notEmpty().withMessage("Nombre obligatorio."),

  body("apellido").trim().notEmpty().withMessage("Apellido obligatorio."),

  body("dpi")
    .matches(/^[0-9]{13}$/)
    .withMessage("DPI inválido."),

  body("correo").isEmail().withMessage("Correo inválido."),

  body("telefono").trim().notEmpty().withMessage("Teléfono obligatorio."),

  body("direccion").trim().notEmpty().withMessage("Dirección obligatoria."),

  body("ingresos_mensuales")
    .isFloat({ min: 100 })
    .withMessage("Ingresos mínimos Q100."),

  body("role").isIn(validRoles).withMessage("Rol inválido."),

  checkValidators,
];
