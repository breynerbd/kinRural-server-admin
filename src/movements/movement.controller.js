import { Movement } from "./movement.model.js";

export const createMovement = async (req, res) => {
  try {
    const movement = await Movement.create(req.body);
    res.status(201).json({ success: true, movement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMovements = async (req, res) => {
  try {
    const movements = await Movement.findAll();

    return res.json({
      success: true,
      movements,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMovementsByAccountId = async (req, res) => {
  try {
    const { account_id } = req.params;

    const movements = await Movement.findAll({
      where: { account_id },
    });

    return res.json({
      success: true,
      movements,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
