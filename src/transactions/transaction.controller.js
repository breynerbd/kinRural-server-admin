import { Op } from "sequelize";
import { db } from "../../configs/db.js";

import { Transaction } from "./transaction.model.js";
import { Account } from "../accounts/account.model.js";
import { Movement } from "../movements/movement.model.js";
import { DailyLimit } from "../dailyLimit/dailyLimit.model.js";
import { Reversal } from "../reversals/reversal.model.js";
import { User } from "../users/user.model.js";

import { TRANSACTION_RULES } from "../constants/transactionRules.js";
import { TRANSACTION_TYPES } from "../constants/transactionTypes.js";
import { MOVEMENT_TYPES } from "../constants/movementTypes.js";
import { Transaction as SequelizeTransaction } from "sequelize";

// ======================================================
// TRANSFER
// ======================================================

export const transfer = async (req, res) => {
  const t = await db.transaction();

  const { cuenta_origen_id, cuenta_destino_id, monto } = req.body;

  const montoNum = Number(monto);

  let transactionCreated = null;

  try {
    // ======================================================
    // VALIDACIONES BÁSICAS
    // ======================================================

    if (cuenta_origen_id === cuenta_destino_id) {
      throw new Error("No puedes transferir a la misma cuenta");
    }

    if (Number.isNaN(montoNum) || montoNum <= 0) {
      throw new Error("Monto inválido");
    }

    // ======================================================
    // OBTENER CUENTAS CON BLOQUEO
    // ======================================================

    const [cuentaOrigen, cuentaDestino] = await Promise.all([
      Account.findByPk(cuenta_origen_id, {
        transaction: t,
        lock: SequelizeTransaction.LOCK.UPDATE,
      }),
      Account.findByPk(cuenta_destino_id, {
        transaction: t,
        lock: SequelizeTransaction.LOCK.UPDATE,
      }),
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
      lock: SequelizeTransaction.LOCK.UPDATE,
    });

    if (!limite) {
      limite = await DailyLimit.create(
        {
          fecha: hoy,
          total_transferido: 0,
        },
        {
          transaction: t,
        },
      );
    }

    const nuevoTotal = Number(limite.total_transferido) + montoNum;

    if (nuevoTotal > TRANSACTION_RULES.DAILY_TRANSFER_LIMIT) {
      throw new Error("Límite diario excedido");
    }

    // ======================================================
    // CREAR TRANSACCIÓN
    // ======================================================

    transactionCreated = await Transaction.create(
      {
        tipo: TRANSACTION_TYPES.TRANSFER,
        monto: montoNum,
        cuenta_origen_id,
        cuenta_destino_id,
      },
      {
        transaction: t,
      },
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
    // CREAR MOVIMIENTOS
    // ======================================================

    const esEgreso = (op) =>
      ["TRANSFERENCIA", "RETIRO", "PAGO_PRESTAMO"].includes(op);

    await Movement.bulkCreate(
      [
        {
          tipo_operacion: TRANSACTION_TYPES.TRANSFER,
          tipo_movimiento: "DEBITO", // origen siempre egresa
          monto: montoNum,
          transaction_id: transactionCreated.id,
          account_id: cuentaOrigen.id,
        },
        {
          tipo_operacion: TRANSACTION_TYPES.TRANSFER,
          tipo_movimiento: "CREDITO", // destino siempre ingresa
          monto: montoNum,
          transaction_id: transactionCreated.id,
          account_id: cuentaDestino.id,
        },
      ],
      { transaction: t },
    );

    // ======================================================
    // ACTUALIZAR LÍMITE
    // ======================================================

    limite.total_transferido = nuevoTotal;

    await limite.save({
      transaction: t,
    });

    await t.commit();

    return res.status(200).json({
      success: true,
      message: "Transferencia exitosa",
      transaction: transactionCreated,
    });
  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }

    // ======================================================
    // REGISTRAR REVERSIÓN SOLO SI EXISTIÓ TRANSACCIÓN
    // ======================================================

    if (transactionCreated) {
      try {
        await Reversal.create({
          motivo: error.message,
          cuenta_origen_id,
          cuenta_destino_id,
          monto: montoNum,
        });
      } catch (reversalError) {
        console.error("Error al registrar reversión:", reversalError);
      }
    }

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
      order: [["createdAt", "DESC"]],
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

    const account = await Account.findByPk(id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Cuenta no encontrada",
      });
    }

    const transactions = await Transaction.findAll({
      where: {
        [Op.or]: [
          {
            cuenta_origen_id: id,
          },
          {
            cuenta_destino_id: id,
          },
        ],
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
      order: [["createdAt", "DESC"]],
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

// ======================================================
// DEPOSIT
// ======================================================

export const deposit = async (req, res) => {
  const t = await db.transaction();
  const { cuenta_destino_id, monto } = req.body;
  const montoNum = Number(monto);
  let transactionCreated = null;

  try {
    if (Number.isNaN(montoNum) || montoNum <= 0) {
      throw new Error("Monto inválido para depósito");
    }

    // Obtener y bloquear la cuenta destino para asegurar atomicidad
    const cuentaDestino = await Account.findByPk(cuenta_destino_id, {
      transaction: t,
      lock: SequelizeTransaction.LOCK.UPDATE,
    });

    if (!cuentaDestino) {
      throw new Error("Cuenta destino no encontrada");
    }

    // Crear la transacción base
    transactionCreated = await Transaction.create(
      {
        tipo: TRANSACTION_TYPES.DEPOSIT,
        monto: montoNum,
        cuenta_origen_id: null, // No aplica origen en depósito en efectivo/caja
        cuenta_destino_id,
      },
      { transaction: t },
    );

    // Actualizar saldo (Crédito)
    cuentaDestino.saldo = Number(cuentaDestino.saldo) + montoNum;
    await cuentaDestino.save({ transaction: t });

    // Generar Movimiento Contable
    const esEgreso = ["RETIRO", "TRANSFERENCIA", "PAGO_PRESTAMO"].includes(
      TRANSACTION_TYPES.DEPOSIT,
    );

    await Movement.create(
      {
        tipo_operacion: TRANSACTION_TYPES.DEPOSIT,
        tipo_movimiento: esEgreso ? "DEBITO" : "CREDITO",
        monto: montoNum,
        transaction_id: transactionCreated.id,
        account_id: cuentaDestino.id,
      },
      { transaction: t },
    );

    await t.commit();

    return res.status(200).json({
      success: true,
      message: "Depósito realizado con éxito",
      transaction: transactionCreated,
    });
  } catch (error) {
    if (!t.finished) await t.rollback();

    if (transactionCreated) {
      try {
        await Reversal.create({
          motivo: `FALLO DEPOSITO: ${error.message}`,
          cuenta_origen_id: null,
          cuenta_destino_id,
          monto: montoNum,
        });
      } catch (revErr) {
        console.error("Error al revertir depósito:", revErr);
      }
    }

    return res.status(400).json({ success: false, message: error.message });
  }
};

// ======================================================
// WITHDRAWAL
// ======================================================

export const withdraw = async (req, res) => {
  const t = await db.transaction();
  const { cuenta_origen_id, monto } = req.body;
  const montoNum = Number(monto);
  let transactionCreated = null;

  try {
    if (Number.isNaN(montoNum) || montoNum <= 0) {
      throw new Error("Monto inválido para retiro");
    }

    // Obtener y bloquear la cuenta origen
    const cuentaOrigen = await Account.findByPk(cuenta_origen_id, {
      transaction: t,
      lock: SequelizeTransaction.LOCK.UPDATE,
    });

    if (!cuentaOrigen) {
      throw new Error("Cuenta de origen no encontrada");
    }

    const saldoActual = Number(cuentaOrigen.saldo);
    if (saldoActual < montoNum) {
      throw new Error(
        `Saldo insuficiente para el retiro. Disponible: Q${saldoActual}`,
      );
    }

    // Crear la transacción base
    transactionCreated = await Transaction.create(
      {
        tipo: TRANSACTION_TYPES.WITHDRAWAL,
        monto: montoNum,
        cuenta_origen_id,
        cuenta_destino_id: null, // No aplica destino en retiro en efectivo
      },
      { transaction: t },
    );

    // Actualizar saldo (Débito)
    cuentaOrigen.saldo = saldoActual - montoNum;
    await cuentaOrigen.save({ transaction: t });

    // Generar Movimiento Contable
    const esEgreso = ["RETIRO", "TRANSFERENCIA", "PAGO_PRESTAMO"].includes(
      TRANSACTION_TYPES.WITHDRAWAL,
    );

    await Movement.create(
      {
        tipo_operacion: TRANSACTION_TYPES.WITHDRAWAL,
        tipo_movimiento: esEgreso ? "DEBITO" : "CREDITO",
        monto: montoNum,
        transaction_id: transactionCreated.id,
        account_id: cuentaOrigen.id,
      },
      { transaction: t },
    );

    await t.commit();

    return res.status(200).json({
      success: true,
      message: "Retiro realizado con éxito",
      transaction: transactionCreated,
    });
  } catch (error) {
    if (!t.finished) await t.rollback();

    if (transactionCreated) {
      try {
        await Reversal.create({
          motivo: `FALLO RETIRO: ${error.message}`,
          cuenta_origen_id,
          cuenta_destino_id: null,
          monto: montoNum,
        });
      } catch (revErr) {
        console.error("Error al revertir retiro:", revErr);
      }
    }

    return res.status(400).json({ success: false, message: error.message });
  }
};
