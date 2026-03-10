import cron from "node-cron";
import { applyMonthlyInterests } from "./interest.controller.js";

export const initInterestCron = () => {
    cron.schedule("0 0 1 * *", () => {
        console.log("Iniciando aplicación de intereses mensuales...");
        applyMonthlyInterests();
    });
};