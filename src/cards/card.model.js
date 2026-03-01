import { DataTypes } from "sequelize";
import { db } from "../../configs/db.js";

export const Card = db.define("card", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    account_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    tipo: {
        type: DataTypes.ENUM("DEBITO", "CREDITO"),
        allowNull: false
    },

    numero_tarjeta: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    cvv: {
        type: DataTypes.STRING,
        allowNull: false
    },

    fecha_expiracion: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },

    estado: {
        type: DataTypes.ENUM(
            "PENDIENTE",
            "APROBADA",
            "RECHAZADA",
            "ACTIVA",
            "BLOQUEADA"
        ),
        defaultValue: "PENDIENTE"
    },

    limite_credito: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true
    }

}, {
    tableName: "cards",
    timestamps: true
});