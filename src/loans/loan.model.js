import { DataTypes } from "sequelize";
import { db } from "../../configs/db.js";
import { User } from "../users/user.model.js";
import { Account } from "../accounts/account.model.js";

/* =========================
   LOAN MODEL
========================= */

export const Loan = db.define("loan", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: User, key: "id" }
    },

    account_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Account, key: "id" }
    },

    monto: { type: DataTypes.DECIMAL(12,2), allowNull: false },

    tasa_interes: { type: DataTypes.DECIMAL(5,2), allowNull: false },

    tipo_tasa: {
        type: DataTypes.ENUM("FIJA","VARIABLE"),
        allowNull: false
    },

    plazo_meses: { type: DataTypes.INTEGER, allowNull: false },

    cuota_mensual: { type: DataTypes.DECIMAL(12,2) },

    saldo_pendiente: { type: DataTypes.DECIMAL(12,2) },

    meses_recalculo: { type: DataTypes.INTEGER },

    fecha_inicio: { type: DataTypes.DATE },

    fecha_fin: { type: DataTypes.DATE },

    estado: {
        type: DataTypes.ENUM(
            "PENDING",
            "APPROVED",
            "REJECTED",
            "ACTIVE",
            "DELINQUENT",
            "CLOSED"
        ),
        defaultValue: "PENDING"
    }

},{
    tableName: "loans",
    timestamps: true
});

/* =========================
   LOAN INSTALLMENT MODEL
========================= */

export const LoanInstallment = db.define("loan_installment", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    loan_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Loan, key: "id" }
    },

    numero_cuota: { type: DataTypes.INTEGER, allowNull: false },

    fecha_vencimiento: { type: DataTypes.DATE, allowNull: false },

    monto_cuota: { type: DataTypes.DECIMAL(12,2), allowNull: false },

    interes: { type: DataTypes.DECIMAL(12,2), allowNull: false },

    capital: { type: DataTypes.DECIMAL(12,2), allowNull: false },

    saldo_restante: { type: DataTypes.DECIMAL(12,2), allowNull: false },

    estado: {
        type: DataTypes.ENUM("PENDIENTE","PAGADA","EN_MORA"),
        defaultValue: "PENDIENTE"
    },

    mora_acumulada: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 }

},{
    tableName: "loan_installments",
    timestamps: true
});

/* =========================
   ASSOCIATIONS
========================= */

Loan.belongsTo(User, { foreignKey: "user_id" });
Loan.belongsTo(Account, { foreignKey: "account_id" });

Loan.hasMany(LoanInstallment, { foreignKey: "loan_id" });
LoanInstallment.belongsTo(Loan, { foreignKey: "loan_id" });