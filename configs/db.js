import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve("./.env") });

export const db = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "postgres",
        logging: false,
    }
);

export const dbConnection = async () => {
    try {
        await db.authenticate();
        console.log("✅ PostgreSQL | Connection successful.");

        await db.sync({ alter: true });
        console.log("✅ PostgreSQL | Database synchronized.");
    } catch (error) {
        console.error("❌ PostgreSQL | Connection failed:", error.message);
        process.exit(1);
    }
};

