
import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class AuthService {
  async registerUser({ name, email, password }) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const avatarUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`;
    
    const [result] = await pool.query(
    'INSERT INTO usuarios (nombre, email, password, avatar) VALUES (?, ?, ?, ?)',
    [name, email, hashedPassword, avatarUrl] // 3. Añadimos la nueva URL a los datos
  );
    return { userId: result.insertId };
  }

  async loginUser({ email, password }) {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0) {
      throw new Error('Credenciales inválidas');
    }

    const user = rows[0];
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new Error('Credenciales inválidas');
    }

    const payload = { id: user.id, name: user.nombre };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    return { access_token: accessToken, refresh_token: refreshToken };
  }
 createResetToken(user) {
    return jwt.sign({ id: user.id }, process.env.PASSWORD_RESET_SECRET, {
      expiresIn: '10m',
    });
  }

  async resetPassword({ token, newPassword }) {
    const decoded = jwt.verify(token, process.env.PASSWORD_RESET_SECRET);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await pool.query('UPDATE usuarios SET password = ? WHERE id = ?', [hashedPassword, decoded.id]);
  }
 refreshAccessToken({ refreshToken }) {
    try {
      // 1. Verificamos que el refresh token sea válido usando su secreto
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

      // 2. Si es válido, creamos un nuevo accessToken con el payload del usuario
      const payload = { id: decoded.id, name: decoded.name };
      const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m', // El nuevo token también dura 15 minutos
      });
      
      return newAccessToken;
    } catch (error) {
      // Si el refresh token es inválido o ha expirado, lanzamos un error
      throw new Error('Token de refresco inválido o expirado');
    }
  }

  refreshAccessToken({ refreshToken }) {
    try {
      // 1. Verificamos el refresh token
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

      // 2. Si es válido, creamos un nuevo accessToken
      const payload = { id: decoded.id, name: decoded.name };
      const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m',
      });
      
      return newAccessToken;
    } catch (error) {
      throw new Error('Token de refresco inválido o expirado');
    }
  }

}



export default new AuthService();