import { DataTypes } from "sequelize";
import { db } from "../../configs/db.js";

export const Transaction = db.define("transaction", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tipo: { type: DataTypes.ENUM("DEPOSITO", "RETIRO", "TRANSFERENCIA", "PAGO_PRESTAMO"), allowNull: false },
    monto: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    cuenta_origen_id: { type: DataTypes.INTEGER, allowNull: true },
    cuenta_destino_id: { type: DataTypes.INTEGER, allowNull: true }
}, {
    tableName: "transactions",
    timestamps: true
});
