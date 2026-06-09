import { db } from "../../configs/db.js";
import { Transaction } from "./transaction.model.js";
import { Account } from "../accounts/account.model.js";
import { Movement } from "../movements/movement.model.js";
import { DailyLimit } from "../dailyLimit/dailyLimit.model.js";
import { Reversal } from "../reversals/reversal.model.js";
import { User } from "../users/user.model.js";

const LIMITE_DIARIO = 10000;

// ======================================================
// TRANSFER
// ======================================================

export const transfer = async (req, res) => {
  const t = await db.transaction();
  const { cuenta_origen_id, cuenta_destino_id, monto } = req.body;
  const montoNum = Number(monto);

  try {
    // ======================================================
    // VALIDACIONES BÁSICAS
    // ======================================================

    if (cuenta_origen_id === cuenta_destino_id) {
      throw new Error("No puedes transferir a la misma cuenta");
    }

    if (montoNum <= 0) {
      throw new Error("Monto inválido");
    }

    // ======================================================
    // OBTENER CUENTAS
    // ======================================================

    const [cuentaOrigen, cuentaDestino] = await Promise.all([
      Account.findByPk(cuenta_origen_id, { transaction: t }),
      Account.findByPk(cuenta_destino_id, { transaction: t }),
    ]);

    if (!cuentaOrigen || !cuentaDestino) {
      throw new Error("Cuenta no encontrada");
    }

    const saldoOrigen = Number(cuentaOrigen.saldo);

    // ======================================================
    // VALIDAR SALDO
    // ======================================================

    if (saldoOrigen < montoNum) {
      throw new Error(
        `Saldo insuficiente. Disponible: ${saldoOrigen}, requerido: ${montoNum}`,
      );
    }

    // ======================================================
    // LÍMITE DIARIO
    // ======================================================

    const hoy = new Date().toISOString().split("T")[0];

    let limite = await DailyLimit.findOne({
      where: { fecha: hoy },
      transaction: t,
    });

    if (!limite) {
      limite = await DailyLimit.create(
        { fecha: hoy, total_transferido: 0 },
        { transaction: t },
      );
    }

    const nuevoTotal = Number(limite.total_transferido) + montoNum;

    if (nuevoTotal > LIMITE_DIARIO) {
      throw new Error("Límite diario excedido");
    }

    // ======================================================
    // TRANSACCIÓN PRINCIPAL
    // ======================================================

    const transaction = await Transaction.create(
      {
        tipo: "TRANSFERENCIA",
        monto: montoNum,
        cuenta_origen_id,
        cuenta_destino_id,
      },
      { transaction: t },
    );

    // ======================================================
    // ACTUALIZAR SALDOS
    // ======================================================

    cuentaOrigen.saldo = saldoOrigen - montoNum;
    cuentaDestino.saldo = Number(cuentaDestino.saldo) + montoNum;

    await Promise.all([
      cuentaOrigen.save({ transaction: t }),
      cuentaDestino.save({ transaction: t }),
    ]);

    // ======================================================
    // MOVIMIENTOS
    // ======================================================

    await Movement.bulkCreate(
      [
        {
          tipo_operacion: "TRANSFERENCIA",
          tipo_movimiento: "DEBITO",
          monto: montoNum,
          transaction_id: transaction.id,
          account_id: cuentaOrigen.id,
        },
        {
          tipo_operacion: "TRANSFERENCIA",
          tipo_movimiento: "CREDITO",
          monto: montoNum,
          transaction_id: transaction.id,
          account_id: cuentaDestino.id,
        },
      ],
      { transaction: t },
    );

    // ======================================================
    // ACTUALIZAR LÍMITE
    // ======================================================

    limite.total_transferido = nuevoTotal;
    await limite.save({ transaction: t });

    await t.commit();

    return res.status(200).json({
      success: true,
      message: "Transferencia exitosa",
      transaction,
    });
  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }

    await Reversal.create({
      motivo: error.message,
      cuenta_origen_id,
      cuenta_destino_id,
      monto: montoNum,
    });

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET ALL TRANSACTIONS
// ======================================================

export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      include: [
        {
          model: Account,
          as: "cuenta_origen",
          attributes: ["id", "numero_cuenta", "tipo"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["nombre", "apellido"],
            },
          ],
        },
        {
          model: Account,
          as: "cuenta_destino",
          attributes: ["id", "numero_cuenta", "tipo"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["nombre", "apellido"],
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      transactions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener las transacciones",
      error: error.message,
    });
  }
};

// ======================================================
// GET TRANSACTIONS BY ACCOUNT ID
// ======================================================

export const getTransactionByIdAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const transactions = await Transaction.findAll({
      where: {
        cuenta_origen_id: id,
      },
      include: [
        {
          model: Account,
          as: "cuenta_origen",
          attributes: ["id", "numero_cuenta", "tipo"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["nombre", "apellido"],
            },
          ],
        },
        {
          model: Account,
          as: "cuenta_destino",
          attributes: ["id", "numero_cuenta", "tipo"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["nombre", "apellido"],
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener las transacciones",
      error: error.message,
    });
  }
};
