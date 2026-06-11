export const internalApiKey = (req, res, next) => {
  const apiKey = req.headers["x-internal-key"];

  if (apiKey !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({
      success: false,
      message: "No autorizado",
    });
  }

  next();
};
