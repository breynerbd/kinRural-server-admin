const corsOptions = {
    origin: "http://localhost:5173", // frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

export { corsOptions };