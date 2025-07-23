// src/validators/auth.validator.js
import { body, validationResult } from 'express-validator';

// Reglas de validación para el registro
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es requerido.'),

  body('email')
    .isEmail().withMessage('Debe ser un correo electrónico válido.')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.'),

  // Middleware para procesar los errores de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];