import axios from "axios";
import { EXCHANGE } from "../constants/exchange.js";

export const convertCurrency = async (req, res) => {
  try {
    const { monto, moneda_origen, moneda_destino } = req.query;

    if (!monto || !moneda_origen || !moneda_destino) {
      return res.status(400).json({
        success: false,
        message: "monto, moneda_origen y moneda_destino son requeridos.",
      });
    }

    const montoNumerico = Number(monto);

    if (Number.isNaN(montoNumerico) || montoNumerico <= 0) {
      return res.status(400).json({
        success: false,
        message: "Monto inválido.",
      });
    }

    const origen = moneda_origen.toUpperCase();
    const destino = moneda_destino.toUpperCase();

    if (
      !EXCHANGE.SUPPORTED_CURRENCIES.includes(origen) ||
      !EXCHANGE.SUPPORTED_CURRENCIES.includes(destino)
    ) {
      return res.status(400).json({
        success: false,
        message: "Moneda no soportada.",
      });
    }

    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_API_KEY}/pair/${origen}/${destino}/${montoNumerico}`,
    );

    const { conversion_result, conversion_rate } = response.data;

    return res.json({
      success: true,
      monto_original: montoNumerico,
      moneda_origen: origen,
      moneda_destino: destino,
      tasa_cambio: conversion_rate,
      monto_convertido: conversion_result,
    });
  } catch (error) {
    console.error("❌ convertCurrency:", error.message);

    if (error.response) {
      return res.status(400).json({
        success: false,
        message: "No se pudo obtener el tipo de cambio.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error interno al obtener tipo de cambio.",
    });
  }
};

export const getCurrencies = async (req, res) => {
  try {
    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_API_KEY}/latest/${EXCHANGE.BASE_CURRENCY}`,
    );

    const rates = response.data.conversion_rates;

    const monedas = EXCHANGE.SUPPORTED_CURRENCIES.map((code) => ({
      code,
      rate: rates[code] ?? null,
    }));

    return res.json({
      success: true,
      base: EXCHANGE.BASE_CURRENCY,
      monedas,
    });
  } catch (error) {
    console.error("❌ getCurrencies:", error.message);

    if (error.response) {
      return res.status(400).json({
        success: false,
        message: "No se pudieron obtener las monedas.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error interno al obtener monedas.",
    });
  }
};
