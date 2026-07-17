import dotenv from "dotenv";
import { dbConnection } from "./configs/db.js";
import { initServer } from "./configs/app.js";
import { setupAssociations } from "./src/associations.js";
import "./src/exchange/exchange.router.js";
import "./src/accounts/account.model.js";
import "./src/transactions/transaction.model.js";
import "./src/movements/movement.model.js";
import "./src/reversals/reversal.model.js";
import "./src/cards/card.model.js";
import "./src/statements/statement.model.js";
import "./src/loans/loan.model.js";

dotenv.config();
const PORT = process.env.PORT || 3005;

const startServer = async () => {
  try {
    await dbConnection();
    setupAssociations();

    const app = initServer();

    app.listen(PORT, () => {
      console.log(
        `🚀 Kinrural ADMIN API running at http://localhost:${PORT}/kinrural/v1`,
      );
    });
  } catch (error) {
    console.error("❌ Error starting ADMIN server:", error);
    process.exit(1);
  }
};

startServer();
