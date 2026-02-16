export const validateCreateTransaction = [
    body("fromAccountId")
        .isInt()
        .withMessage("Cuenta origen inválida"),

    body("toAccountId")
        .isInt()
        .withMessage("Cuenta destino inválida"),

    body("amount")
        .isFloat({ gt: 0 })
        .withMessage("El monto debe ser mayor a 0"),

    body("type")
        .isIn(["TRANSFERENCIA", "DEPOSITO", "RETIRO"])
        .withMessage("Tipo de transacción inválido"),

    checkValidators,
];
