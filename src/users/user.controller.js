import axios from "axios";
import { User } from "./user.model.js";
import {
  canAssignRole,
  canManageUser,
  canDeleteUser,
} from "./user.permissions.js";
import { Op } from "sequelize";

// ======================================================
// CREATE USER
// ======================================================

export const createUser = async (req, res) => {
  try {
    const currentUserRole = req.user?.role;

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

    // ======================================================
    // VALIDACIÓN DE ROLES
    // ======================================================

    if (!canAssignRole(currentUserRole, role)) {
      return res.status(403).json({
        success: false,
        message: "No autorizado",
      });
    }

    // ======================================================
    // AUTH SERVICE (crea el usuario y dispara la sincronización
    // local vía /internal/sync-user)
    // ======================================================

    const authResponse = await axios.post(
      `${process.env.AUTH_SERVICE_URL}/api/auth/register`,
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
      {
        headers: {
          Authorization: req.headers.authorization,
        },
      },
    );

    const authUser = authResponse.data?.user;

    if (!authUser?.id) {
      return res.status(500).json({
        success: false,
        message: "Auth-Service no devolvió el usuario.",
      });
    }

    // ======================================================
    // OBTENER EL USUARIO YA SINCRONIZADO
    // (lo crea internamente el Auth Service vía /internal/sync-user,
    // aquí solo lo leemos para devolverlo al frontend)
    // ======================================================

    const user = await User.findOne({
      where: { auth_id: authUser.id },
    });

    if (!user) {
      return res.status(500).json({
        success: false,
        message:
          "El usuario se creó en Auth-Service pero no se sincronizó localmente.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Usuario creado correctamente.",
      user,
    });
  } catch (error) {
    console.error("========== CREATE USER ERROR ==========");
    console.error("MESSAGE:", error.message);
    console.error("RESPONSE STATUS:", error.response?.status);
    console.error("RESPONSE DATA:", error.response?.data);
    console.error("=========================================");

    return res.status(error.response?.status || 500).json({
      success: false,
      message:
        error.response?.data?.message || error.message || "Error interno",
    });
  }
};

// ======================================================
// GET USERS
// ======================================================

export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const currentUserRole = req.user?.role;

    let whereCondition = {};

    if (currentUserRole === "USER") {
      return res.status(403).json({
        success: false,
        message: "No autorizado",
      });
    }

    const safeLimit = Math.min(parseInt(limit) || 10, 100);

    const { count, rows } = await User.findAndCountAll({
      where: whereCondition,
      limit: safeLimit,
      offset: (page - 1) * safeLimit,
      order: [["createdAt", "DESC"]],
    });

    return res.json({
      success: true,
      users: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / safeLimit),
        totalRecords: count,
        limit: safeLimit,
      },
    });
  } catch (error) {
    console.error("❌ getUsers:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET USER BY ID
// ======================================================

export const getUserById = async (req, res) => {
  try {
    const currentUserRole = req.user?.role;

    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado.",
      });
    }

    if (!canManageUser(currentUserRole, user.role)) {
      return res.status(403).json({
        success: false,
        message: "No autorizado",
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("❌ getUserById:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// UPDATE USER
// ======================================================

export const updateUser = async (req, res) => {
  try {
    const currentUserRole = req.user?.role;

    const { id } = req.params;

    const {
      nombre,
      apellido,
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

    if (!canManageUser(currentUserRole, user.role)) {
      return res.status(403).json({
        success: false,
        message: "No autorizado",
      });
    }

    if (role && !canAssignRole(currentUserRole, role)) {
      return res.status(403).json({
        success: false,
        message: "No autorizado",
      });
    }

    // ======================================================
    // AUTH SERVICE
    // ======================================================

    if (role) {
      await axios.put(
        `${process.env.AUTH_SERVICE_URL}/api/auth/users/${user.auth_id}/role`,
        {
          role,
        },
        {
          headers: {
            Authorization: req.headers.authorization,
          },
        },
      );
    }

    // ======================================================
    // UPDATE LOCAL DB
    // ======================================================

    const updateData = {};

    if (nombre !== undefined) updateData.nombre = nombre;
    if (apellido !== undefined) updateData.apellido = apellido;
    if (correo !== undefined) updateData.correo = correo;
    if (telefono !== undefined) updateData.telefono = telefono;
    if (direccion !== undefined) updateData.direccion = direccion;
    if (ingresos_mensuales !== undefined) {
      updateData.ingresos_mensuales = ingresos_mensuales;
    }
    if (role !== undefined) updateData.role = role;

    await user.update(updateData);

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("❌ updateUser:", error.response?.data || error.message);

    return res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || error.message,
    });
  }
};

// ======================================================
// DELETE USER
// ======================================================

export const deleteUser = async (req, res) => {
  try {
    const currentUserRole = req.user?.role;
    const currentUserAuthId = req.user?.auth_id;

    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado.",
      });
    }

    if (!canDeleteUser(currentUserRole, req.user?.auth_id, user)) {
      return res.status(403).json({
        success: false,
        message: "No autorizado",
      });
    }

    // ======================================================
    // DELETE AUTH USER
    // ======================================================

    await axios.delete(
      `${process.env.AUTH_SERVICE_URL}/api/auth/users/${user.auth_id}`,
      {
        headers: {
          Authorization: req.headers.authorization,
        },
      },
    );

    // ======================================================
    // DELETE LOCAL USER
    // ======================================================

    await user.destroy();

    return res.json({
      success: true,
      message: "Usuario eliminado correctamente.",
    });
  } catch (error) {
    console.error("❌ deleteUser:", error);

    return res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || error.message,
    });
  }
};

// ======================================================
// INTERNAL SYNC USER
// ======================================================

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

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ auth_id }, { correo }, { dpi }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "El usuario ya existe.",
      });
    }

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
