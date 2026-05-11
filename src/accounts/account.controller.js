import { Account } from "./account.model.js";
import { nanoid } from "nanoid";
import { User } from "../users/user.model.js";

export const createAccount = async (req, res) => {
    try {
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

