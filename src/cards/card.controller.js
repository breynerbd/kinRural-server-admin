import { Card } from "./card.model.js";
import { CARD_STATUS } from "../constants/cardStatus.js";

export const approveCard = async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;

  const card = await Card.findByPk(id);
  if (!card) return res.status(404).json({ message: "Tarjeta no encontrada" });

  if (card.estado !== CARD_STATUS.PENDING)
    return res.status(400).json({ message: "Ya procesada" });
  if (action !== CARD_STATUS.APPROVED && action !== CARD_STATUS.REJECTED) {
    return res.status(400).json({
      success: false,
      message: "Acción inválida",
    });
  }
  card.estado = action;
  await card.save();

  res.json({ success: true, card });
};

export const activateCard = async (req, res) => {
  const { id } = req.params;

  const card = await Card.findByPk(id);
  if (!card) return res.status(404).json({ message: "No encontrada" });

  if (card.estado !== CARD_STATUS.APPROVED)
    return res.status(400).json({ message: "Debe estar aprobada" });

  card.estado = CARD_STATUS.ACTIVE;
  await card.save();

  res.json({ success: true, message: "Tarjeta activada" });
};

export const blockCard = async (req, res) => {
  const { id } = req.params;

  const card = await Card.findByPk(id);

  if (!card) {
    return res.status(404).json({
      message: "Tarjeta no encontrada",
    });
  }

  if (card.estado !== CARD_STATUS.ACTIVE) {
    return res.status(400).json({
      success: false,
      message: "Solo se pueden bloquear tarjetas activas.",
    });
  }

  card.estado = CARD_STATUS.BLOCKED;
  await card.save();

  res.json({
    success: true,
    message: "Tarjeta bloqueada",
  });
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
