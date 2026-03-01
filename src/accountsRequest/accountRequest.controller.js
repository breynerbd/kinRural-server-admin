import { AccountRequest } from "./accountRequest.model.js";
import { Account } from "../accounts/account.model.js";
import { nanoid } from "nanoid";

// =============================
// Ver todas las solicitudes
// =============================
export const getAllRequests = async (req, res) => {
    try {
        const requests = await AccountRequest.findAll({
            order: [["createdAt", "DESC"]]
        });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// =============================
// Aprobar solicitud
// =============================
export const approveRequest = async (req, res) => {
    try {
        const request = await AccountRequest.findByPk(req.params.id);

        if (!request) {
            return res.status(404).json({ message: "Solicitud no encontrada." });
        }

        if (request.status !== "PENDIENTE") {
            return res.status(400).json({
                message: "La solicitud ya fue procesada."
            });
        }

        // 🔹 Contar cuentas actuales del usuario
        const ahorroCount = await Account.count({
            where: {
                user_id: request.user_id,
                tipo: "AHORRO"
            }
        });

        const monetariaCount = await Account.count({
            where: {
                user_id: request.user_id,
                tipo: "MONETARIA"
            }
        });

        // 🔹 Validar límites
        if (request.tipo === "AHORRO" && ahorroCount >= 2) {
            return res.status(400).json({
                message: "El usuario ya tiene el máximo de 2 cuentas de ahorro."
            });
        }

        if (request.tipo === "MONETARIA" && monetariaCount >= 1) {
            return res.status(400).json({
                message: "El usuario ya tiene una cuenta monetaria."
            });
        }

        // 🔹 Crear número de cuenta
        const numero_cuenta = nanoid(10);

        // 🔹 Crear cuenta
        await Account.create({
            numero_cuenta,
            tipo: request.tipo,
            saldo: 0.00,
            user_id: request.user_id
        });

        // 🔹 Actualizar solicitud
        request.status = "APROBADA";
        await request.save();

        res.json({
            message: "Cuenta aprobada correctamente."
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// =============================
// Rechazar solicitud
// =============================
export const rejectRequest = async (req, res) => {
    try {
        const request = await AccountRequest.findByPk(req.params.id);

        if (!request) {
            return res.status(404).json({ message: "Solicitud no encontrada." });
        }

        if (request.status !== "PENDIENTE") {
            return res.status(400).json({
                message: "La solicitud ya fue procesada."
            });
        }

        request.status = "RECHAZADA";
        await request.save();

        res.json({ message: "Solicitud rechazada correctamente." });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};