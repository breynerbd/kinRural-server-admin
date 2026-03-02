import { Account } from "../accounts/account.model.js";
import { Movement } from "../movements/movement.model.js";
import { Statement } from "./statement.model.js";
import { db } from "../../configs/db.js";
import { Op } from "sequelize";

export const generateMonthlyStatements = async () => {
    const t = await db.transaction();
    try {
        const fechaActual = new Date();
        const mesAnterior = fechaActual.getMonth() === 0 ? 12 : fechaActual.getMonth();
        const anioAnterior = fechaActual.getMonth() === 0 ? fechaActual.getFullYear() - 1 : fechaActual.getFullYear();

        const fechaInicio = new Date(anioAnterior, mesAnterior - 1, 1);
        const fechaFin = new Date(anioAnterior, mesAnterior, 0, 23, 59, 59);

        const accounts = await Account.findAll({ transaction: t });

        for (const account of accounts) {
            const movements = await Movement.findAll({
                where: {
                    account_id: account.id,
                    createdAt: { [Op.between]: [fechaInicio, fechaFin] }
                },
                transaction: t
            });

            let creditos = 0;
            let debitos = 0;

            movements.forEach(m => {
                const monto = parseFloat(m.monto);
                m.tipo_movimiento === "CREDITO" ? creditos += monto : debitos += monto;
            });

            const saldoFinal = parseFloat(account.saldo);
            const saldoInicial = saldoFinal - creditos + debitos;

            await Statement.create({
                mes: mesAnterior,
                anio: anioAnterior,
                saldo_inicial: saldoInicial,
                total_creditos: creditos,
                total_debitos: debitos,
                saldo_final: saldoFinal,
                account_id: account.id
            }, { transaction: t });
        }

        await t.commit();
        console.log(`[Cierre] Estados de cuenta generados para el periodo ${mesAnterior}/${anioAnterior}`);
    } catch (error) {
        await t.rollback();
        console.error("Error al generar estados de cuenta:", error.message);
    }
};