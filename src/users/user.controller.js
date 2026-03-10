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

        if (ingresos_mensuales < 100) {
            return res.status(400).json({
                success: false,
                message: "No puede crear cuenta con ingresos menores a Q100"
            });
        }

        // 1️⃣ Crear usuario en auth-service
        const authResponse = await axios.post(
            "http://host.docker.internal:5070/api/auth/register",
            {
                name: nombre,
                surname: apellido,
                username,
                email: correo,
                password
            }
        );

        console.log("AUTH RESPONSE:", authResponse.data);

        if (!authResponse.data?.user?.id) {
            return res.status(500).json({
                success: false,
                message: "Auth-Service no devolvió el ID del usuario"
            });
        }

        const authId = authResponse.data.user.id;

        // 2️⃣ Crear usuario en admin
        const user = await User.create({
            nombre,
            apellido,
            dpi,
            correo,
            telefono,
            direccion,
            ingresos_mensuales,
            role_id,
            auth_id: authId
        });

        // 3️⃣ 🔵 SINCRONIZAR CON USER-SERVICE (AQUÍ)
        await axios.post(
            "http://host.docker.internal:3005/kinrural/v1/internal/sync-user",
            {
                auth_id: authId,
                nombre,
                apellido,
                correo,
                dpi,
                telefono,
                direccion,
                ingresos_mensuales,
                role_id
            }
        );

        res.status(201).json({
            success: true,
            message: "Usuario creado en Admin, Auth-Service y User-Service",
            user
        });

    } catch (error) {

        const errorMsg = error.response?.data || error.message;

        console.error("❌ Error:", errorMsg);

        res.status(500).json({
            success: false,
            message: errorMsg
        });

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

