import { body } from "express-validator";
import { checkValidators } from "./check-validators.js";

// ======================================================
// CREATE TRANSACTION VALIDATOR
// ======================================================

export const validateCreateTransaction = [
  // ======================================================
  // CUENTA ORIGEN
  // ======================================================

  body("cuenta_origen_id")
    .notEmpty()
    .withMessage("La cuenta de origen es obligatoria.")
    .isInt({ min: 1 })
    .withMessage("Cuenta origen inválida."),

  // ======================================================
  // CUENTA DESTINO
  // ======================================================

  body("cuenta_destino_id")
    .notEmpty()
    .withMessage("La cuenta de destino es obligatoria.")
    .isInt({ min: 1 })
    .withMessage("Cuenta destino inválida."),

  // ======================================================
  // MONTO
  // ======================================================

  body("monto")
    .notEmpty()
    .withMessage("El monto es obligatorio.")
    .isFloat({ gt: 0 })
    .withMessage("El monto debe ser mayor a 0."),

  // ======================================================
  // TRANSFERENCIA A LA MISMA CUENTA
  // ======================================================

  body("cuenta_destino_id").custom((value, { req }) => {
    if (value === req.body.cuenta_origen_id) {
      throw new Error("No puedes transferir a la misma cuenta.");
    }
    return true;
  }),

  // ======================================================
  // VALIDATION RESULT
  // ======================================================

  checkValidators,
];
