export const validateDailyLimit = [
    body("accountId")
        .isInt()
        .withMessage("Cuenta inválida"),

    body("dailyLimit")
        .isFloat({ gt: 0 })
        .withMessage("El límite diario debe ser mayor a 0"),

    checkValidators,
];
