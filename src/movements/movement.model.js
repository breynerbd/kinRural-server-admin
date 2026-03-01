import { DataTypes } from "sequelize";
import { db } from "../../configs/db.js";

export const Movement = db.define("movement", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tipo_operacion: {
        type: DataTypes.ENUM("TRANSFERENCIA", "DEPOSITO", "RETIRO", "PAGO_PRESTAMO"),
        allowNull: false
    },
    tipo_movimiento: {
        type: DataTypes.ENUM("DEBITO", "CREDITO"),
        allowNull: false
    },
    monto: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    transaction_id: { type: DataTypes.INTEGER, allowNull: false },
    account_id: { type: DataTypes.INTEGER, allowNull: false }
}, {
    tableName: "movements",
    timestamps: true
});
