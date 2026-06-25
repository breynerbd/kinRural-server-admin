import { Movement } from "./movement.model.js";

export const createMovement = async (req, res) => {
  try {
    const { tipo_operacion, monto, transaction_id, account_id } = req.body;

    // Lógica dinámica para determinar si es débito o crédito
    const esEgreso = ["RETIRO", "TRANSFERENCIA", "PAGO_PRESTAMO"].includes(
      tipo_operacion,
    );

    const movementData = {
      tipo_operacion,
      tipo_movimiento: esEgreso ? "DEBITO" : "CREDITO",
      monto,
      transaction_id,
      account_id,
    };

    const movement = await Movement.create(movementData);
    res.status(201).json({ success: true, movement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMovements = async (req, res) => {
  try {
    const movements = await Movement.findAll();

    return res.json({
      success: true,
      movements,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMovementsByAccountId = async (req, res) => {
  try {
    const { account_id } = req.params;

    const movements = await Movement.findAll({
      where: { account_id },
    });

    return res.json({
      success: true,
      movements,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
