export const errorHandler = (err, req, res, next) => {
    console.error(`Error: ${err.message}`);
    console.error(`Stack: ${err.stack}`);
    console.error(`Request: ${req.method} ${req.path}`);

    if (err.name === 'SequelizeValidationError') {
        const errors = err.errors.map(error => ({
            field: error.path,
            message: error.message
        }));

        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors
        });
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
            success: false,
            message: 'Registro duplicado',
            error: 'DUPLICATE_FIELD'
        });
    }

    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
            success: false,
            message: 'Referencia inválida',
            error: 'INVALID_REFERENCE'
        });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expirado'
        });
    }

    if (err.statusCode) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }

    res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
    });
};
