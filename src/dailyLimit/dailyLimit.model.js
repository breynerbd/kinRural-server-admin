import { DataTypes } from "sequelize";
import { db } from "../../configs/db.js";

export const DailyLimit = db.define("daily_limit", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    total_transferido: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.0 }
}, {
    tableName: "daily_limits",
    timestamps: true
});
