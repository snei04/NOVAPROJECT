// src/controllers/auth.controller.js
import AuthService from '../services/auth.service.js';
import pool from '../config/database.js';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nombre, email y contraseña son requeridos.' });
    }
    
    const newUser = await AuthService.registerUser({ name, email, password });
    res.status(201).json({ message: 'Usuario registrado exitosamente', userId: newUser.userId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'El correo electrónico ya está en uso.' });
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
    }

    const tokens = await AuthService.loginUser({ email, password });
    res.status(200).json(tokens);
  } catch (error) {
    if (error.message === 'Credenciales inválidas') {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const [userRows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (userRows.length > 0) {
      const user = userRows[0];
      const resetToken = AuthService.createResetToken(user);
      console.log(`Enlace de recuperación (simulado): http://localhost:4200/recovery?token=${resetToken}`);
    }

    res.status(200).json({ message: 'Si el correo existe, se ha enviado un enlace de recuperación.' });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    await AuthService.resetPassword({ token, newPassword });
    res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: 'No se proporcionó un token de refresco' });
    }
    const newAccessToken = AuthService.refreshAccessToken({ refreshToken });
    res.status(200).json({ access_token: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: 'Token de refresco inválido o expirado' });
  }
};

export const isAvailable = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email es requerido' });
  }
  try {
    const [userRows] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);

    // Si no se encuentra ninguna fila (rows.length === 0), el email está disponible.
    res.status(200).json({ isAvailable: userRows.length === 0 });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
