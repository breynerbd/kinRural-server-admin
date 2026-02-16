import { DataTypes } from "sequelize";
import { db } from "../../configs/db.js";

export const User = db.define("user", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }, // cambiar user_id → id
    nombre: { type: DataTypes.STRING, allowNull: false },
    apellido: { type: DataTypes.STRING, allowNull: false },
    dpi: { type: DataTypes.STRING, allowNull: false, unique: true },
    correo: { type: DataTypes.STRING, allowNull: false, unique: true },
    telefono: { type: DataTypes.STRING, allowNull: false },
    direccion: { type: DataTypes.STRING, allowNull: false },
    ingresos_mensuales: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    role_id: { type: DataTypes.INTEGER, allowNull: false }
}, {
    tableName: "users",
    timestamps: true
});
