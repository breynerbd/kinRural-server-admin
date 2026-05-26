import { User } from "./users/user.model.js";
import { Account } from "./accounts/account.model.js";
import { Transaction } from "./transactions/transaction.model.js";
import { Movement } from "./movements/movement.model.js";
import { DailyLimit } from "./dailyLimit/dailyLimit.model.js";
import { Reversal } from "./reversals/reversal.model.js";
import { Card } from "./cards/card.model.js";
import { Statement } from "./statements/statement.model.js";

export const setupAssociations = () => {
  User.hasMany(Account, {
    foreignKey: "user_id",
    as: "accounts",
  });

  Account.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
  });

  // ================= TRANSACTIONS =================

  // Cuenta origen
  Transaction.belongsTo(Account, {
    foreignKey: "cuenta_origen_id",
    as: "cuenta_origen",
  });

  // Cuenta destino
  Transaction.belongsTo(Account, {
    foreignKey: "cuenta_destino_id",
    as: "cuenta_destino",
  });

  Account.hasMany(Transaction, {
    foreignKey: "cuenta_origen_id",
    as: "transacciones_origen",
  });

  Account.hasMany(Transaction, {
    foreignKey: "cuenta_destino_id",
    as: "transacciones_destino",
  });

  Account.hasMany(Movement, { foreignKey: "account_id" });
  Movement.belongsTo(Account, { foreignKey: "account_id" });

  Transaction.hasMany(Movement, { foreignKey: "transaction_id" });
  Movement.belongsTo(Transaction, { foreignKey: "transaction_id" });

  Account.hasMany(Card, { foreignKey: "account_id" });
  Card.belongsTo(Account, { foreignKey: "account_id" });

  Account.hasMany(Statement, { foreignKey: "account_id" });
  Statement.belongsTo(Account, { foreignKey: "account_id" });
};
