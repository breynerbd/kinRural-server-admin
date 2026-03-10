import { DataTypes } from "sequelize";
import { db } from "../../configs/db.js";

export const Statement = db.define("statement", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    mes: { type: DataTypes.INTEGER, allowNull: false },
    anio: { type: DataTypes.INTEGER, allowNull: false },
    saldo_inicial: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.0 },
    total_creditos: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.0 },
    total_debitos: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.0 },
    saldo_final: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.0 },
    account_id: { type: DataTypes.INTEGER, allowNull: false }
}, {
    tableName: "statements",
    timestamps: true
});