export const validateCreateAccount = [
    body("userId")
        .isInt()
        .withMessage("El usuario debe ser un ID válido"),

    body("type")
        .notEmpty()
        .withMessage("El tipo de cuenta es requerido")
        .isIn(["AHORRO", "CORRIENTE"])
        .withMessage("Tipo de cuenta inválido"),

    body("balance")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("El saldo no puede ser negativo"),

    checkValidators,
];
