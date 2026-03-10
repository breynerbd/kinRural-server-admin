import { DataTypes } from "sequelize";
import { db } from "../../configs/db.js";

export const Role = db.define("role", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING, allowNull: false, unique: true }
}, {
    tableName: "roles",
    timestamps: true
});
