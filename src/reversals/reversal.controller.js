import { Reversal } from "./reversal.model.js";

export const createReversal = async (req, res) => {
  try {
    const reversal = await Reversal.create(req.body);

    return res.status(201).json({
      success: true,
      reversal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getReversals = async (req, res) => {
  try {
    const reversals = await Reversal.findAll();

    return res.json({
      success: true,
      reversals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
