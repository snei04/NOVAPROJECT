import { Router } from 'express';
import { register, login, forgotPassword, resetPassword, refreshToken, isAvailable, checkUserExists } from '../controllers/auth.controller.js';
import { validateRegister } from '../validators/auth.validator.js';

const router = Router();

// Ruta para el registro de usuarios
router.post('/register', validateRegister, register);

// Ruta para el inicio de sesión
router.post('/login', login);
router.post('/recovery', forgotPassword);
router.post('/change-password', resetPassword);
router.post('/refresh-token', refreshToken);
router.post('/is-available', isAvailable);
router.post('/check-user', checkUserExists);


export default router;