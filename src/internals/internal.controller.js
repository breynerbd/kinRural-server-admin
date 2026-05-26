import { User } from "../users/user.model.js";

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
        role,
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
        role,
      });
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
