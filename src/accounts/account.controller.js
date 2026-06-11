import { Account } from "./account.model.js";
import { nanoid } from "nanoid";
import { User } from "../users/user.model.js";
import { ACCOUNT_RULES } from "../constants/accountRules.js";

export const createAccount = async (req, res) => {
  try {
    const { saldo } = req.body;
    const saldoNumerico = Number(saldo);

    if (
      saldo === undefined ||
      Number.isNaN(saldoNumerico) ||
      saldoNumerico < ACCOUNT_RULES.MIN_INITIAL_BALANCE
    ) {
      return res.status(400).json({
        success: false,
        message: `No se pudo crear la cuenta. El saldo inicial mínimo requerido es de ${ACCOUNT_RULES.MIN_INITIAL_BALANCE}.`,
      });
    }

    const numero_cuenta = nanoid(10);

    const account = await Account.create({
      ...req.body,
      saldo: saldoNumerico,
      numero_cuenta,
    });

    const accountWithUser = await Account.findByPk(account.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "nombre", "apellido"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      account: accountWithUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAccounts = async (req, res) => {
  try {
    const accounts = await Account.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "nombre", "apellido"],
        },
      ],
    });

    res.json({
      success: true,
      accounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAccountById = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await Account.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "nombre", "apellido"],
        },
      ],
    });

    if (!account) {
      return res
        .status(404)
        .json({ success: false, message: "Cuenta no encontrada" });
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
      return res
        .status(404)
        .json({ success: false, message: "Cuenta no encontrada" });
    }
    if (Number(account.saldo) !== 0) {
      return res.status(400).json({
        success: false,
        message: "La cuenta debe tener saldo cero para ser eliminada.",
      });
    }
    await account.destroy();
    res.json({ success: true, message: "Cuenta eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
