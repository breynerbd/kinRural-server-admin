import { Card } from "./card.model.js";

export const approveCard = async (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // APROBADA o RECHAZADA

    const card = await Card.findByPk(id);
    if (!card) return res.status(404).json({ message: "Tarjeta no encontrada" });

    if (card.estado !== "PENDIENTE")
        return res.status(400).json({ message: "Ya procesada" });

    card.estado = action;
    await card.save();

    res.json({ success: true, card });
};

export const activateCard = async (req, res) => {
    const { id } = req.params;

    const card = await Card.findByPk(id);
    if (!card) return res.status(404).json({ message: "No encontrada" });

    if (card.estado !== "APROBADA")
        return res.status(400).json({ message: "Debe estar aprobada" });

    card.estado = "ACTIVA";
    await card.save();

    res.json({ success: true, message: "Tarjeta activada" });
};

export const blockCard = async (req, res) => {
    const { id } = req.params;

    const card = await Card.findByPk(id);
    if (!card) return res.status(404).json({ message: "No encontrada" });

    card.estado = "BLOQUEADA";
    await card.save();

    res.json({ success: true, message: "Tarjeta bloqueada" });
};

export const getAllCards = async (req, res) => {
    const cards = await Card.findAll();
    res.json(cards);
};

export const getCardsByAccountId = async (req, res) => {
    const { id } = req.params;
    const cards = await Card.findAll({ where: { account_id: id } });
    res.json(cards);
};
