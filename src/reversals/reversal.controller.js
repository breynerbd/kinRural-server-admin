import { Reversal } from "./reversal.model.js";

export const createReversal = async (req, res) => {
    try {
        const reversal = await Reversal.create(req.body);
        res.status(201).json({ success: true, reversal });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getReversals = async (req, res) => {
    const reversals = await Reversal.findAll();
    res.json({ success: true, reversals });
};
