// src/middleware/boardAuth.middleware.js
import pool from '../config/database.js';

// Función para obtener el boardId desde diferentes tipos de rutas
const getBoardIdFromRequest = async (req) => {
  // 1. Caso explícito: boardId en params (ej: /boards/:boardId/...)
  if (req.params.boardId) {
    return req.params.boardId;
  }

  // 2. Caso ruta principal de boards: /api/v1/boards/:id
  // Si la URL base contiene 'boards' y hay un parámetro 'id', asumimos que ES el boardId.
  // Esto cubre GET /boards/:id, PUT /boards/:id, DELETE /boards/:id
  if (req.baseUrl.endsWith('/boards') && req.params.id) {
    // Validación extra: asegurar que no estamos en una sub-ruta que use :id para otra cosa
    // Pero en board.routes.js, :id siempre es el boardId para las rutas montadas en /boards
    return req.params.id;
  }

  // 3. Casos indirectos (Cards/Lists)
  // Si estamos aquí, probablemente estamos en /api/v1/cards/:id o /api/v1/lists/:id
  const id = req.params.id;
  if (!id) return null;

  try {
    // Busca el boardId a través de la tarjeta
    let [rows] = await pool.query('SELECT l.board_id FROM cards c JOIN lists l ON c.list_id = l.id WHERE c.id = ?', [id]);
    if (rows.length > 0) return rows[0].board_id;

    // Si no, busca a través de la lista
    [rows] = await pool.query('SELECT board_id FROM lists WHERE id = ?', [id]);
    if (rows.length > 0) return rows[0].board_id;
  } catch (error) {
    console.error('Error buscando boardId indirecto:', error);
    return null;
  }

  return null;
};

export const isBoardMember = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const boardId = await getBoardIdFromRequest(req); // Usando tu función helper
    if (!boardId) {
      return res.status(400).json({ message: 'No se pudo determinar el ID del tablero.' });
    }

    // UNA SOLA CONSULTA PARA VERIFICAR SI ES DUEÑO O MIEMBRO
    const [rows] = await pool.query(`
      SELECT b.user_id as ownerId, bm.role 
      FROM boards b 
      LEFT JOIN board_members bm ON b.id = bm.board_id AND bm.user_id = ?
      WHERE b.id = ?
    `, [userId, boardId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Tablero no encontrado.' });
    }

    const { ownerId, role } = rows[0];
    const isOwner = ownerId === userId;
    const isMember = role !== null;

    // Si no es ni dueño ni miembro, se le deniega el acceso
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'No tienes permiso para ver este tablero.' });
    }
    
    // Guardamos el rol para usarlo después (si es dueño, su rol es 'owner')
    req.boardRole = isOwner ? 'owner' : role;
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