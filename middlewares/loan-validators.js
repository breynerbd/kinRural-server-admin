/* =========================
   APROBAR PRÉSTAMO
========================= */
export const validateApproveLoan = [
  body("id")
    .isInt()
    .withMessage("ID de préstamo inválido"),
];

/* =========================
   RECHAZAR PRÉSTAMO
========================= */
export const validateRejectLoan = [
  body("id")
    .isInt()
    .withMessage("ID de préstamo inválido"),
];

/* =========================
   PAGAR CUOTA
========================= */
export const validatePayInstallment = [
  body("installment_id")
    .isInt()
    .withMessage("ID de cuota inválido"),
];

/* =========================
   EJECUTAR CHECK MORA
========================= */
export const validateCheckMora = [
  body()
    .isEmpty()
    .withMessage("Esta operación no requiere body"),
];