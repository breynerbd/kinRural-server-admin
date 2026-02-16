import { DataTypes } from "sequelize";
import { db } from "../../configs/db.js";
import { User } from "../users/user.model.js";

export const Account = db.define("account", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    numero_cuenta: { type: DataTypes.STRING, unique: true, allowNull: false },
    tipo: { type: DataTypes.ENUM("AHORRO", "MONETARIA"), allowNull: false },
    saldo: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.0 },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: User, key: "id" }
    }
}, {
    tableName: "accounts",
    timestamps: true
});
