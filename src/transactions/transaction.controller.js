import { db } from "../../configs/db.js";
import { Transaction } from "./transaction.model.js";
import { Account } from "../accounts/account.model.js";
import { Movement } from "../movements/movement.model.js";
import { DailyLimit } from "../dailyLimit/dailyLimit.model.js";
import { Reversal } from "../reversals/reversal.model.js";
import { User } from "../users/user.model.js";

const LIMITE_DIARIO = 10000;

export const transfer = async (req, res) => {
    const t = await db.transaction();

    try {
        const { cuenta_origen_id, cuenta_destino_id, monto } = req.body;

        if (monto <= 0) {
            throw new Error("Monto inválido");
        }

        const cuentaOrigen = await Account.findByPk(cuenta_origen_id, { transaction: t });
        const cuentaDestino = await Account.findByPk(cuenta_destino_id, { transaction: t });

        if (!cuentaOrigen || !cuentaDestino) {
            throw new Error("Cuenta no encontrada");
        }

        if (parseFloat(cuentaOrigen.saldo) < monto) {
            throw new Error("Saldo insuficiente");
        }

        const hoy = new Date().toISOString().split("T")[0];

        let limite = await DailyLimit.findOne({ where: { fecha: hoy }, transaction: t });
        if (!limite) {
            limite = await DailyLimit.create({ fecha: hoy, total_transferido: 0 }, { transaction: t });
        }

        if (parseFloat(limite.total_transferido) + monto > LIMITE_DIARIO) {
            throw new Error("Límite diario excedido");
        }

        const transaction = await Transaction.create({
            tipo: "TRANSFERENCIA",
            monto,
            cuenta_origen_id,
            cuenta_destino_id
        }, { transaction: t });

        cuentaOrigen.saldo = parseFloat(cuentaOrigen.saldo) - monto;
        cuentaDestino.saldo = parseFloat(cuentaDestino.saldo) + monto;

        await cuentaOrigen.save({ transaction: t });
        await cuentaDestino.save({ transaction: t });

        await Movement.create({
            tipo_operacion: "TRANSFERENCIA",
            tipo_movimiento: "DEBITO",
            monto,
            transaction_id: transaction.id,
            account_id: cuentaOrigen.id
        }, { transaction: t });

        await Movement.create({
            tipo_operacion: "TRANSFERENCIA",
            tipo_movimiento: "CREDITO",
            monto,
            transaction_id: transaction.id,
            account_id: cuentaDestino.id
        }, { transaction: t });

        limite.total_transferido = parseFloat(limite.total_transferido) + monto;
        await limite.save({ transaction: t });

        await t.commit();

        res.status(200).json({
            message: "Transferencia exitosa",
            transaction
        });

    } catch (error) {
        await t.rollback();

        await Reversal.create({
            motivo: error.message,
            estado: "COMPLETADO"
        });

        res.status(400).json({
            message: "Error en transferencia",
            error: error.message
        });
    }
};

export const getAllTransactions = async (req, res) => {
    try {

        const transactions = await Transaction.findAll({
            include: [
                {
                    model: Account,
                    as: "cuenta_origen",
                    attributes: [
                        "id",
                        "numero_cuenta",
                        "tipo"
                    ],
                    include: [
                        {
                            model: User,
                            as: "user",
                            attributes: [
                                "nombre",
                                "apellido"
                            ]
                        }
                    ]
                },
                {
                    model: Account,
                    as: "cuenta_destino",
                    attributes: [
                        "id",
                        "numero_cuenta",
                        "tipo"
                    ],
                    include: [
                        {
                            model: User,
                            as: "user",
                            attributes: [
                                "nombre",
                                "apellido"
                            ]
                        }
                    ]
                }
            ]
        });

        res.status(200).json(transactions);

    } catch (error) {

        res.status(500).json({
            message: "Error al obtener las transacciones",
            error: error.message
        });

    }
};

export const getTransactionByIdAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const transactions = await Transaction.findAll({ where: { cuenta_origen_id: id, 
            include: [
                {
                    model: Account,
                    as: "cuenta_origen",
                    attributes: [
                        "id",
                        "numero_cuenta",
                        "tipo"
                    ],
                    include: [
                        {
                            model: User,
                            as: "user",
                            attributes: [
                                "nombre",
                                "apellido"
                            ]
                        }
                    ]
                },
                {
                    model: Account,
                    as: "cuenta_destino",
                    attributes: [
                        "id",
                        "numero_cuenta",
                        "tipo"
                    ],
                    include: [
                        {
                            model: User,
                            as: "user",
                            attributes: [
                                "nombre",
                                "apellido"
                            ]
                        }
                    ]
                }
            ]
        } });
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las transacciones", error: error.message });
    }
};
