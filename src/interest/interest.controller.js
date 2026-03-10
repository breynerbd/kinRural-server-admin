import { db } from "../../configs/db.js";
import { Account } from "../accounts/account.model.js";
import { Movement } from "../movements/movement.model.js";
import { Transaction } from "../transactions/transaction.model.js";
import { Op } from "sequelize";

const TASA_ANUAL = 0.05;

export const applyMonthlyInterests = async () => {
    const t = await db.transaction();
    try {
        const hoy = new Date();
        const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

        const accounts = await Account.findAll({
            where: {
                tipo: "AHORRO",
                saldo: { [Op.gt]: 0 },
                [Op.or]: [
                    { fecha_ultimo_interes: { [Op.lt]: primerDiaMes } },
                    { fecha_ultimo_interes: null }
                ]
            },
            transaction: t
        });

        if (accounts.length === 0) {
            await t.commit();
            return { message: "No hay cuentas pendientes de intereses." };
        }

        for (const account of accounts) {
            const montoInteres = parseFloat((account.saldo * (TASA_ANUAL / 12)).toFixed(2));

            if (montoInteres <= 0) continue;

            const transaction = await Transaction.create({
                tipo: "DEPOSITO",
                monto: montoInteres,
                cuenta_destino_id: account.id
            }, { transaction: t });

            account.saldo = parseFloat(account.saldo) + montoInteres;
            account.fecha_ultimo_interes = hoy;
            await account.save({ transaction: t });

            await Movement.create({
                tipo_operacion: "INTERESES",
                tipo_movimiento: "CREDITO",
                monto: montoInteres,
                transaction_id: transaction.id,
                account_id: account.id
            }, { transaction: t });
        }

        await t.commit();
        console.log(`[Cron] Intereses aplicados a ${accounts.length} cuentas.`);
    } catch (error) {
        await t.rollback();
        console.error("Error en proceso de intereses:", error.message);
    }
};