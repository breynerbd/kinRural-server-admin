import dotenv from "dotenv";
import { dbConnection } from "./configs/db.js";
import { initServer } from "./configs/app.js";
import { initServerUser } from "../kinRural-server-user/configs/app.js";
import { onlyUser } from "../kinRural-server-user/middlewares/onlyUser.js";
import { setupAssociations } from "./src/associations.js";

import "./src/users/user.model.js";
import "./src/accounts/account.model.js";
import "./src/transactions/transaction.model.js";
import "./src/movements/movement.model.js";
import "./src/reversals/reversal.model.js";
import "./src/roles/role.model.js";

dotenv.config();
const PORT = process.env.PORT || 3005;

const startServer = async () => {
    try {
        await dbConnection();
        setupAssociations();

        // Inicializamos ambos servidores como routers
        const app = initServer();
        const appUser = initServerUser();

        // Montamos el server-user dentro del server-admin
        app.use('/kinrural/v1/user', onlyUser, appUser);

        app.listen(PORT, () => {
            console.log(`🚀 Kinrural API running at http://localhost:${PORT}/kinrural/v1`);
        });
    } catch (error) {
        console.error("❌ Error starting server:", error);
        process.exit(1);
    }
};

startServer();
