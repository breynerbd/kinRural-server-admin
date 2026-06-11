import { User } from "../users/user.model.js";
import { ROLES } from "../constants/roles.js";

export const syncUserFromAuth = async (req, res) => {
  try {
    const {
      auth_id,
      nombre,
      apellido,
      correo,
      dpi,
      telefono,
      direccion,
      ingresos_mensuales,
      role,
    } = req.body;

    if (!auth_id || !correo) {
      return res.status(400).json({
        success: false,
        message: "auth_id y correo son obligatorios",
      });
    }

    const allowedRoles = Object.values(ROLES);

    const safeRole = allowedRoles.includes(role) ? role : ROLES.USER;

    let user = await User.findOne({
      where: { auth_id },
    });

    if (!user) {
      user = await User.create({
        auth_id,
        nombre,
        apellido,
        correo,
        dpi,
        telefono,
        direccion,
        ingresos_mensuales,
        role: safeRole,
      });
    } else {
      await user.update({
        nombre,
        apellido,
        correo,
        dpi,
        telefono,
        direccion,
        ingresos_mensuales,
        role: safeRole,
      });

      await user.reload();
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
