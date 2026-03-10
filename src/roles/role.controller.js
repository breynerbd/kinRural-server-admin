import { Role } from "./role.model.js";

export const createRole = async (req, res) => {
    try {
        const role = await Role.create(req.body);
        res.status(201).json({ success: true, role });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getRoles = async (req, res) => {
    const roles = await Role.findAll();
    res.json({ success: true, roles });
};

export const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;
        const role = await Role.findByPk(id);

        if (!role) {
            return res.status(404).json({ success: false, message: "Rol no encontrado" });
        }

        await role.destroy();
        res.json({ success: true, message: "Rol eliminado correctamente" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

