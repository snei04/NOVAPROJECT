// src/middleware/boardAuth.middleware.js
import pool from '../config/database.js';

// Función para obtener el boardId desde diferentes tipos de rutas
const getBoardIdFromRequest = async (req) => {
  let boardId = req.params.boardId;
  if (!boardId) {
    const id = req.params.id; // Puede ser cardId o listId
    if (!id) return null;

    // Busca el boardId a través de la tarjeta
    let [rows] = await pool.query('SELECT l.board_id FROM cards c JOIN lists l ON c.list_id = l.id WHERE c.id = ?', [id]);
    if (rows.length > 0) return rows[0].board_id;

    // Si no, busca a través de la lista
    [rows] = await pool.query('SELECT board_id FROM lists WHERE id = ?', [id]);
    if (rows.length > 0) return rows[0].board_id;
  }
  return boardId;
};

export const isBoardMember = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const boardId = await getBoardIdFromRequest(req);
    if (!boardId) return res.status(400).json({ message: 'No se pudo determinar el ID del tablero.' });

    const [memberRows] = await pool.query('SELECT role FROM board_members WHERE board_id = ? AND user_id = ?', [boardId, userId]);
    if (memberRows.length === 0) {
      return res.status(403).json({ message: 'No eres miembro de este tablero.' });
    }

    req.boardRole = memberRows[0].role; // Guardamos el rol para usarlo después
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error interno al verificar la membresía.' });
  }
};

export const isBoardOwner = async (req, res, next) => {
  try {
    console.log('--- [DEBUG] Iniciando middleware isBoardOwner ---');
    const userId = req.user.id;
    console.log(`--- [DEBUG] User ID del token: ${userId} (Tipo: ${typeof userId})`);

    // Usaremos la función helper que ya tienes
    const boardId = await getBoardIdFromRequest(req);
    console.log(`--- [DEBUG] boardId encontrado: ${boardId} (Tipo: ${typeof boardId})`);

    if (!boardId) {
      return res.status(400).json({ message: 'No se pudo determinar el ID del tablero.' });
    }

    const [memberRows] = await pool.query(
      'SELECT role FROM board_members WHERE board_id = ? AND user_id = ?',
      [boardId, userId]
    );
    
    if (memberRows.length > 0) {
      console.log(`--- [DEBUG] Rol encontrado en DB: ${memberRows[0].role}`);
    } else {
      console.log('--- [DEBUG] No se encontró ninguna fila para ese boardId y userId.');
    }

    if (memberRows.length === 0 || memberRows[0].role !== 'owner') {
      console.log('--- [DEBUG] ACCESO DENEGADO ---');
      return res.status(403).json({ message: 'Acción no autorizada. Se requiere rol de administrador.' });
    }

    console.log('--- [DEBUG] ACCESO PERMITIDO ---');
    next();
  } catch (error) {
    console.error('--- [DEBUG] ERROR FATAL EN MIDDLEWARE ---', error);
    res.status(500).json({ message: 'Error interno al verificar los permisos.' });
  }
};