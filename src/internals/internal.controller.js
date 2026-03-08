import { User } from "../users/user.model.js";

export const syncUserFromAuth = async (req, res) => {
    const { auth_id, email } = req.body;

    let user = await User.findOne({
        where: { auth_id }
    });

    if (!user) {
        user = await User.create({
            auth_id,
            nombre: "PENDIENTE",
            apellido: "PENDIENTE",
            correo: email,
            dpi: "PENDIENTE",
            telefono: "PENDIENTE",
            direccion: "PENDIENTE",
            ingresos_mensuales: 0,
            role_id: 2
        });
    }

    return res.status(200).json({ success: true });
};