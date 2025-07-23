// src/middleware/boardAuth.middleware.js
import pool from '../config/database.js';

// Middleware para verificar si un usuario es miembro de un tablero
export const isBoardMember = async (req, res, next) => {
  try {
    const boardId = req.params.boardId || req.params.id; // Funciona para /boards/:id o /boards/:boardId/activity
    const userId = req.user.id;

    const [rows] = await pool.query(
      'SELECT role FROM board_members WHERE board_id = ? AND user_id = ?',
      [boardId, userId]
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: 'No eres miembro de este tablero.' });
    }

    // Adjuntamos el rol a la petición para usarlo en el siguiente controlador
    req.boardRole = rows[0].role;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor al verificar membresía.' });
  }
};

// Middleware para verificar si un usuario es el DUEÑO del tablero
export const isBoardOwner = (req, res, next) => {
  if (req.boardRole && req.boardRole === 'owner') {
    next();
  } else {
    return res.status(403).json({ message: 'Acción permitida solo para el dueño del tablero.' });
  }
};