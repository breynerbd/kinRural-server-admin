import { Router } from "express";
import { convertCurrency, getCurrencies } from "./exchange.controller.js";
import { authenticateUser } from "../../middlewares/authenticateUser.js";

export const exchangeRouter = Router();

// GET /exchange/convert?monto=100&moneda_origen=GTQ&moneda_destino=USD
exchangeRouter.get("/convert", authenticateUser, convertCurrency);

// GET /exchange/currencies
exchangeRouter.get("/currencies", authenticateUser, getCurrencies);
