import { DataTypes } from "sequelize";
import { db } from "../../configs/db.js";

export const AccountRequest = db.define("account_request", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    tipo: {
        type: DataTypes.ENUM("AHORRO", "MONETARIA"),
        allowNull: false
    },

    dpi: {
        type: DataTypes.STRING(13),
        allowNull: false
    },

    fullName: {
        type: DataTypes.STRING,
        allowNull: false
    },

    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false
    },

    status: {
        type: DataTypes.ENUM("PENDIENTE", "APROBADA", "RECHAZADA"),
        defaultValue: "PENDIENTE"
    }

}, {
    tableName: "account_requests",
    timestamps: true
});