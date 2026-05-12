import axios from "axios";
import { User } from "./user.model.js";

export const createUser = async (req, res) => {
    try {
        const {
            nombre,
            apellido,
            dpi,
            correo,
            telefono,
            direccion,
            ingresos_mensuales,
            role_id,
            username,
            password
        } = req.body;

        // ========== VALIDACIONES ==========
        if (!nombre || nombre.trim() === "") {
            return res.status(400).json({ success: false, message: "El nombre es obligatorio." });
        }

        if (!apellido || apellido.trim() === "") {
            return res.status(400).json({ success: false, message: "El apellido es obligatorio." });
        }

        if (!dpi || !/^[0-9]{13}$/.test(dpi)) {
            return res.status(400).json({ success: false, message: "El DPI debe tener exactamente 13 dígitos." });
        }

        const dpiExistente = await User.findOne({ where: { dpi } });
        if (dpiExistente) {
            return res.status(400).json({ success: false, message: "Ya existe un usuario con ese DPI." });
        }

        if (!correo || !/^\S+@\S+\.\S+$/.test(correo)) {
            return res.status(400).json({ success: false, message: "El correo no es válido." });
        }

        const correoExistente = await User.findOne({ where: { correo } });
        if (correoExistente) {
            return res.status(400).json({ success: false, message: "Ya existe un usuario con ese correo." });
        }

        if (!telefono || telefono.toString().trim() === "") {
            return res.status(400).json({ success: false, message: "El teléfono es obligatorio." });
        }

        if (!direccion || direccion.trim() === "") {
            return res.status(400).json({ success: false, message: "La dirección es obligatoria." });
        }

        if (!ingresos_mensuales || ingresos_mensuales < 100) {
            return res.status(400).json({ success: false, message: "Los ingresos mensuales deben ser al menos Q100." });
        }

        if (!role_id) {
            return res.status(400).json({ success: false, message: "El rol es obligatorio." });
        }

        if (!username || username.trim() === "") {
            return res.status(400).json({ success: false, message: "El username es obligatorio." });
        }

        if (!password || password.length < 8) {
    return res.status(400).json({ success: false, message: "La contraseña debe tener al menos 8 caracteres." });
}

        // ========== CREAR EN AUTH-SERVICE ==========
        const authResponse = await axios.post(
            "http://host.docker.internal:5070/api/auth/register",
            { name: nombre, surname: apellido, username, email: correo, password }
        );

        if (!authResponse.data?.user?.id) {
            return res.status(500).json({ success: false, message: "Auth-Service no devolvió el ID del usuario." });
        }

        const authId = authResponse.data.user.id;

        // ========== CREAR EN ADMIN ==========
        const user = await User.create({
            nombre, apellido, dpi, correo, telefono,
            direccion, ingresos_mensuales, role_id, auth_id: authId
        });

        // ========== SINCRONIZAR CON USER-SERVICE ==========
        await axios.post(
            "http://host.docker.internal:3005/kinrural/v1/internal/sync-user",
            { auth_id: authId, nombre, apellido, correo, dpi, telefono, direccion, ingresos_mensuales, role_id }
        );

        res.status(201).json({ success: true, message: "Usuario creado correctamente.", user });

    }  catch (error) {
    const data = error.response?.data;

    // auth-service manda { title, errors: { Campo: ["msg"] } }
    // otros servicios mandan { message } o { error }
    let message = "Error al crear usuario.";

    if (data?.errors) {
        // extrae el primer mensaje de validación del auth-service
        const firstField = Object.values(data.errors)[0];
        message = Array.isArray(firstField) ? firstField[0] : firstField;
    } else if (typeof data?.message === "string") {
        message = data.message;
    } else if (typeof data?.error === "string") {
        message = data.error;
    } else if (typeof data?.title === "string") {
        message = data.title;
    }

    const status = error.response?.status || 500;

    console.error("❌ Error:", message);
    res.status(status).json({ success: false, message });
}
};

export const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const { count, rows } = await User.findAndCountAll({
            limit: parseInt(limit),
            offset: (page - 1) * limit,
            order: [["createdAt", "DESC"]],
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalRecords: count,
                limit: parseInt(limit),
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado." });
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
            return res.status(404).json({ success: false, message: "Usuario no encontrado." });
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
            return res.status(404).json({ success: false, message: "Usuario no encontrado." });
        }

        await user.destroy();
        res.json({ success: true, message: "Usuario eliminado correctamente." });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};