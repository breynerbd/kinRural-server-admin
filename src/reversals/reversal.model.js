import { DataTypes } from "sequelize";
import { db } from "../../configs/db.js";

export const Reversal = db.define("reversal", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    motivo: { type: DataTypes.STRING },
    estado: { type: DataTypes.ENUM("PENDIENTE", "COMPLETADO"), defaultValue: "PENDIENTE" }
}, {
    tableName: "reversals",
    timestamps: true
});
