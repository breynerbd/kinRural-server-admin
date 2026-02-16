import { User } from "./user.model.js";

export const createUser = async (req, res) => {
    try {
        const { ingresos_mensuales } = req.body;

        if (ingresos_mensuales < 100) {
            return res.status(400).json({
                success: false,
                message: "No puede crear cuenta con ingresos menores a Q100"
            });
        }

        const user = await User.create(req.body);
        res.status(201).json({ success: true, user });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUsers = async (req, res) => {
    const users = await User.findAll();
    res.json({ success: true, users });
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }

        await user.update(req.body);
        res.json({ success: true, user });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }

        res.json({ success: true, user });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }

        await user.destroy();
        res.json({ success: true, message: "Usuario eliminado correctamente" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

