export const validateReversal = [
    body("transactionId")
        .isInt()
        .withMessage("ID de transacción inválido"),

    body("reason")
        .notEmpty()
        .withMessage("La razón de reversión es requerida")
        .isLength({ max: 300 })
        .withMessage("La razón no puede exceder 300 caracteres"),

    checkValidators,
];
