import { User } from "./users/user.model.js";
import { Role } from "./roles/role.model.js";
import { Account } from "./accounts/account.model.js";
import { Transaction } from "./transactions/transaction.model.js";
import { Movement } from "./movements/movement.model.js";
import { DailyLimit } from "./dailyLimit/dailyLimit.model.js";
import { Reversal } from "./reversals/reversal.model.js";
import { Card } from "./cards/card.model.js";
import { Beneficiary } from "../../kinRural-server-user/src/beneficiaries/beneficiary.model.js";

export const setupAssociations = () => {
    Role.hasMany(User, { foreignKey: "role_id" });
    User.belongsTo(Role, { foreignKey: "role_id" });

    User.hasMany(Account, { foreignKey: "user_id" });
    Account.belongsTo(User, { foreignKey: "user_id" });

    Account.hasMany(Movement, { foreignKey: "account_id" });
    Movement.belongsTo(Account, { foreignKey: "account_id" });

    Transaction.hasMany(Movement, { foreignKey: "transaction_id" });
    Movement.belongsTo(Transaction, { foreignKey: "transaction_id" });

    Account.hasMany(Card, { foreignKey: "account_id" });
    Card.belongsTo(Account, { foreignKey: "account_id" });

    Account.hasMany(Beneficiary, { foreignKey: "account_id" });
    Beneficiary.belongsTo(Account, { foreignKey: "account_id" });

    User.hasMany(Beneficiary, { foreignKey: "user_id" });
    Beneficiary.belongsTo(User, { foreignKey: "user_id" });
};
