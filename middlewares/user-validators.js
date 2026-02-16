import { body, param } from 'express-validator';
import { checkValidators } from './check-validators.js';

export const validateCreatePromotion = [
    body('title')
        .notEmpty()
        .withMessage('Título es requerido')
        .isLength({ min: 2, max: 100 })
        .withMessage('Título debe tener entre 2 y 100 caracteres'),
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Descripción no puede exceder 500 caracteres'),
    body('restaurant')
        .notEmpty()
        .isMongoId()
        .withMessage('ID de restaurante no válido'),
    checkValidators,
];

export const validateUpdatePromotionRequest = [
    param('id').isMongoId().withMessage('ID debe ser un ObjectId válido de MongoDB'),
    body('title').optional().isLength({ min: 2, max: 100 }).withMessage('Título debe tener entre 2 y 100 caracteres'),
    body('description').optional().isLength({ max: 500 }).withMessage('Descripción no puede exceder 500 caracteres'),
    checkValidators,
];

export const validatePromotionStatusChange = [
    param('id').isMongoId().withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

export const validateGetPromotionById = [
    param('id').isMongoId().withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];
