import { Account } from "./account.model.js";
import { nanoid } from "nanoid";
import { User } from "../users/user.model.js";

export const createAccount = async (req, res) => {
    try {
        const SALDO_MINIMO = 100; // Define aquí tu saldo mínimo requerido
        
        // Extraemos el saldo enviado por el cliente (asumiendo que se llama 'saldo' o 'balance')
        const { saldo } = req.body;

        // 1. Validamos que el usuario envíe un saldo y que cumpla con el mínimo
        if (saldo === undefined || Number(saldo) < SALDO_MINIMO) {
            return res.status(400).json({ 
                success: false, 
                message: `No se pudo crear la cuenta. El saldo inicial mínimo requerido es de ${SALDO_MINIMO}.` 
            });
        }

        // 2. Si pasa la validación, generamos el número de cuenta aleatorio con nanoid
        const numero_cuenta = nanoid(10);

        const account = await Account.create({
            ...req.body,
            numero_cuenta
        });

        res.status(201).json({ success: true, account });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAccounts = async (req, res) => {
    try {

        const accounts = await Account.findAll({
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: [
                        "id",
                        "nombre",
                        "apellido"
                    ]
                }
            ]
        });

        res.json({
            success: true,
            accounts
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const getAccountById = async (req, res) => {
    try {
        const { id } = req.params;
        const account = await Account.findByPk(id);

        if (!account) {
            return res.status(404).json({ success: false, message: "Cuenta no encontrada" });
        }

        res.json({ success: true, account });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteAccountById = async (req, res) => {
    try {
        const { id } = req.params;
        const account = await Account.findByPk(id);

        if (!account) {
            return res.status(404).json({ success: false, message: "Cuenta no encontrada" });
        }

        await account.destroy();
        res.json({ success: true, message: "Cuenta eliminada correctamente" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

