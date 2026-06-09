import axios from "axios";

export const convertCurrency = async (req, res) => {
  try {
    const { monto, moneda_origen, moneda_destino } = req.query;

    if (!monto || !moneda_origen || !moneda_destino) {
      return res.status(400).json({
        success: false,
        message: "monto, moneda_origen y moneda_destino son requeridos.",
      });
    }

    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_API_KEY}/pair/${moneda_origen}/${moneda_destino}/${monto}`,
    );

    const { conversion_result, conversion_rate } = response.data;

    return res.json({
      success: true,
      monto_original: Number(monto),
      moneda_origen: moneda_origen.toUpperCase(),
      moneda_destino: moneda_destino.toUpperCase(),
      tasa_cambio: conversion_rate,
      monto_convertido: conversion_result,
    });
  } catch (error) {
    console.error("❌ convertCurrency:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error al obtener tipo de cambio.",
    });
  }
};

export const getCurrencies = async (req, res) => {
  try {
    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_API_KEY}/latest/GTQ`,
    );

    const rates = response.data.conversion_rates;

    // Solo las monedas más relevantes
    const relevantes = ["USD", "EUR", "MXN", "GTQ", "HNL", "NIO", "CRC", "GBP"];

    const monedas = relevantes.map((code) => ({
      code,
      rate: rates[code] ?? null,
    }));

    return res.json({
      success: true,
      base: "GTQ",
      monedas,
    });
  } catch (error) {
    console.error("❌ getCurrencies:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error al obtener monedas.",
    });
  }
};
