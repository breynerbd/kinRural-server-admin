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
      role,
      username,
      password,
    } = req.body;

    // ========== VALIDACIONES ==========
    if (!nombre?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "El nombre es obligatorio." });
    }

    if (!apellido?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "El apellido es obligatorio." });
    }

    if (!dpi || !/^[0-9]{13}$/.test(dpi)) {
      return res
        .status(400)
        .json({ success: false, message: "El DPI debe tener 13 dígitos." });
    }

    if (await User.findOne({ where: { dpi } })) {
      return res
        .status(400)
        .json({ success: false, message: "Ya existe un usuario con ese DPI." });
    }

    if (!correo || !/^\S+@\S+\.\S+$/.test(correo)) {
      return res
        .status(400)
        .json({ success: false, message: "Correo inválido." });
    }

    if (await User.findOne({ where: { correo } })) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un usuario con ese correo.",
      });
    }

    if (!telefono?.toString().trim()) {
      return res
        .status(400)
        .json({ success: false, message: "El teléfono es obligatorio." });
    }

    if (!direccion?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "La dirección es obligatoria." });
    }

    if (!ingresos_mensuales || ingresos_mensuales < 100) {
      return res.status(400).json({
        success: false,
        message: "Ingresos mínimos Q100.",
      });
    }

    if (!role) {
      return res
        .status(400)
        .json({ success: false, message: "El rol es obligatorio." });
    }

    if (!username?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Username obligatorio." });
    }

    if (!password || password.length < 8) {
      return res
        .status(400)
        .json({ success: false, message: "Password mínimo 8 caracteres." });
    }

    // ========== AUTH-SERVICE ==========
    const authResponse = await axios.post(
      "http://host.docker.internal:5070/api/auth/register",
      {
        name: nombre,
        surname: apellido,
        username,
        email: correo,
        password,
        dpi,
        telefono,
        direccion,
        ingresosMensuales: ingresos_mensuales,
        role,
      },
    );

    const authUser = authResponse.data?.user;

    if (!authUser?.id) {
      return res.status(500).json({
        success: false,
        message: "Auth-Service no devolvió el usuario.",
      });
    }

    // ========== SOLO SINCRONIZACIÓN (NO CREAR AQUÍ USER) ==========
    const syncResponse = await axios.post(
      "http://localhost:3005/kinrural/v1/internal/sync-user",
      {
        auth_id: authUser.id,
        nombre,
        apellido,
        dpi,
        correo,
        telefono,
        direccion,
        ingresos_mensuales,
        role,
      },
    );

    const user = syncResponse.data?.user;

    return res.status(201).json({
      success: true,
      message: "Usuario creado correctamente.",
      user,
    });
  } catch (error) {
    const data = error.response?.data;

    let message = "Error al crear usuario.";

    if (data?.errors) {
      const firstField = Object.values(data.errors)[0];
      message = Array.isArray(firstField) ? firstField[0] : firstField;
    } else if (data?.message) {
      message = data.message;
    } else if (data?.error) {
      message = data.error;
    } else if (data?.title) {
      message = data.title;
    }

    console.error("❌ Error:", message);

    return res.status(error.response?.status || 500).json({
      success: false,
      message,
    });
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
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nombre,
      apellido,
      dpi,
      correo,
      telefono,
      direccion,
      ingresos_mensuales,
      role,
    } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado.",
      });
    }

    // ========== SYNC AUTH-SERVICE ==========
    await axios.put(
      `http://host.docker.internal:5070/api/auth/users/${user.auth_id}/role`,
      {
        role,
      },
      {
        headers: {
          Authorization: req.headers.authorization,
        },
      },
    );

    // ========== UPDATE LOCAL DB ==========
    await user.update({
      nombre,
      apellido,
      dpi,
      correo,
      telefono,
      direccion,
      ingresos_mensuales,
      role,
    });

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("❌ updateUser:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado." });
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
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado." });
    }

    await user.destroy();
    res.json({ success: true, message: "Usuario eliminado correctamente." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const syncUser = async (req, res) => {
  try {
    const {
      auth_id,
      nombre,
      apellido,
      dpi,
      correo,
      telefono,
      direccion,
      ingresos_mensuales,
      role,
    } = req.body;

    // ========== VALIDACIONES ==========
    if (!auth_id) {
      return res.status(400).json({
        success: false,
        message: "auth_id es obligatorio.",
      });
    }

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "role es obligatorio.",
      });
    }

    // ========== EVITAR DUPLICADOS ==========
    const existingUser = await User.findOne({
      where: {
        auth_id,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "El usuario ya existe.",
      });
    }

    // ========== CREAR USUARIO ==========
    const user = await User.create({
      auth_id,
      nombre,
      apellido,
      dpi,
      correo,
      telefono,
      direccion,
      ingresos_mensuales,
      role,
    });

    return res.status(201).json({
      success: true,
      message: "Usuario sincronizado correctamente.",
      user,
    });
  } catch (error) {
    console.error("❌ syncUser:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
