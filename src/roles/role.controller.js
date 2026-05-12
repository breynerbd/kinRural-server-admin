import { Role } from "./role.model.js";
import { Op } from "sequelize";

export const createRole = async (req, res) => {
    try {
        const { nombre } = req.body;

        // ========== VALIDACIONES ==========
        if (!nombre || nombre.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "El nombre del rol es obligatorio."
            });
        }

        if (nombre.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "El nombre del rol debe tener al menos 2 caracteres."
            });
        }

        const existingRole = await Role.findOne({
            where: { nombre: nombre.trim().toUpperCase() }
        });

        if (existingRole) {
            return res.status(400).json({
                success: false,
                message: `El rol "${nombre.toUpperCase()}" ya existe.`
            });
        }

        // ========== CREAR ==========
        const role = await Role.create({
            nombre: nombre.trim().toUpperCase()
        });

        res.status(201).json({ success: true, role });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getRoles = async (req, res) => {
    try {
        const roles = await Role.findAll();
        res.json({ success: true, roles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;
        const role = await Role.findByPk(id);

        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Rol no encontrado."
            });
        }

        await role.destroy();
        res.json({ success: true, message: "Rol eliminado correctamente." });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};