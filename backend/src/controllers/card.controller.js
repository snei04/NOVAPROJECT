import pool from '../config/database.js';
import CardService from '../services/card.service.js';

// --- CREAR TARJETA (Solo para Dueños) ---
export const createCard = async (req, res) => {
  try {
    const { listId } = req.body;
    const userId = req.user.id;

    const [permissionRows] = await pool.query(`
      SELECT b.user_id 
      FROM lists l
      JOIN boards b ON l.board_id = b.id
      WHERE l.id = ?
    `, [listId]);

    if (permissionRows.length === 0) {
      return res.status(404).json({ message: 'La lista no existe.' });
    }

    if (permissionRows[0].user_id !== userId) {
      return res.status(403).json({ message: 'Solo los dueños del tablero pueden crear tarjetas.' });
    }

    const newCard = await CardService.createCard(req.body);
    res.status(201).json(newCard);
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// --- ACTUALIZAR TARJETA (LÓGICA DE PERMISOS FINAL Y CORRECTA) ---
export const updateCard = async (req, res) => {
  const { id } = req.params; // ID de la tarjeta
  const userId = req.user.id; // ID del usuario que edita
  const updates = req.body;

  try {
    // 1. Obtenemos el ID del dueño del tablero directamente.
    const [cardOwnerRows] = await pool.query(`
      SELECT b.user_id as ownerId
      FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      WHERE c.id = ?
    `, [id]);

    if (cardOwnerRows.length === 0) {
      return res.status(404).json({ message: 'Tarjeta no encontrada.' });
    }
    const isOwner = cardOwnerRows[0].ownerId === userId;

    // 2. Si NO es el dueño, verificamos si es un miembro.
    if (!isOwner) {
      const [memberRows] = await pool.query(`
        SELECT bm.role FROM board_members bm
        JOIN lists l ON bm.board_id = l.board_id
        JOIN cards c ON l.id = c.list_id
        WHERE bm.user_id = ? AND c.id = ?
      `, [userId, id]);

      if (memberRows.length === 0) {
        return res.status(403).json({ message: 'No tienes permiso para editar esta tarjeta.' });
      }

      // 3. Aplicamos la restricción para miembros.
      const allowedUpdatesForMember = ['position', 'listId'];
      const requestedUpdates = Object.keys(updates);
      const isTryingToEditContent = requestedUpdates.some(key => !allowedUpdatesForMember.includes(key));
      if (isTryingToEditContent) {
        return res.status(403).json({ message: 'Como miembro, solo puedes mover tarjetas.' });
      }
    }
    
    // 4. Si es el dueño (o un miembro con permiso para mover), llamamos al servicio para actualizar.
    await CardService.updateCard(id, updates);
    res.status(200).json({ message: 'Tarjeta actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar la tarjeta:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


// --- BORRAR TARJETA (Solo para Dueños) ---
export const deleteCard = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [permissionRows] = await pool.query(`
            SELECT b.user_id 
            FROM cards c
            JOIN lists l ON c.list_id = l.id
            JOIN boards b ON l.board_id = b.id
            WHERE c.id = ?
        `, [id]);

        if (permissionRows.length === 0) {
            return res.status(404).json({ message: 'Tarjeta no encontrada.' });
        }

        if (permissionRows[0].user_id !== userId) {
            return res.status(403).json({ message: 'Solo los dueños del tablero pueden eliminar tarjetas.' });
        }
        
        await pool.query('DELETE FROM cards WHERE id = ?', [id]);
        res.status(200).json({ message: 'Tarjeta eliminada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const assignMemberToCard = async (req, res) => {
  const { cardId, userIdToAssign } = req.body;
  const requesterId = req.user.id;

  console.log('\n--- [DEBUG] INICIANDO ASIGNACIÓN ---');
  console.log(`- Datos recibidos: cardId=${cardId}, userIdToAssign=${userIdToAssign}, requesterId=${requesterId}`);

try {
    const [cardData] = await pool.query('SELECT l.board_id FROM cards c JOIN lists l ON c.list_id = l.id WHERE c.id = ?', [cardId]);
    if (cardData.length === 0) {
      console.log(`- [DEBUG] FALLO: No se encontró la tarjeta con id ${cardId}.`);
      return res.status(404).json({ message: 'Tarjeta no encontrada.' });
    }
    const boardId = cardData[0].board_id;
    console.log(`- [DEBUG] La tarjeta pertenece al tablero (boardId): ${boardId}`);

    const [memberRows] = await pool.query('SELECT user_id FROM board_members WHERE board_id = ?', [boardId]);
    const memberIds = memberRows.map(m => m.user_id);
    console.log(`- [DEBUG] Miembros del tablero: [${memberIds.join(', ')}]`);

    if (!memberIds.includes(Number(requesterId))) {
      console.log(`- [DEBUG] FALLO: El usuario que pide (${requesterId}) no es miembro.`);
      return res.status(403).json({ message: 'No tienes permiso para asignar miembros en este tablero.' });
    }
    if (!memberIds.includes(Number(userIdToAssign))) {
      console.log(`- [DEBUG] FALLO: El usuario a asignar (${userIdToAssign}) no es miembro.`);
      return res.status(404).json({ message: 'El usuario que intentas asignar no es miembro de este tablero.' });
    }

    console.log('- [DEBUG] ÉXITO: Todas las verificaciones de permisos pasaron.');
    await pool.query('INSERT INTO card_assignees (card_id, user_id) VALUES (?, ?)', [cardId, userIdToAssign]);
    res.status(201).json({ message: 'Miembro asignado a la tarjeta exitosamente.' });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Este usuario ya está asignado a la tarjeta.' });
    }
    console.error("--- [DEBUG] ERROR INESPERADO ---", error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
// Quitar un miembro de una tarjeta
export const removeMemberFromCard = async (req, res) => {
    const { cardId, userIdToRemove } = req.params;
    const requesterId = req.user.id;

    console.log('\n--- [DEBUG] INICIANDO ELIMINACIÓN DE ASIGNACIÓN ---');
    console.log(`- Datos recibidos: cardId=${cardId}, userIdToRemove=${userIdToRemove}, requesterId=${requesterId}`);

     try {
    const [cardData] = await pool.query('SELECT l.board_id FROM cards c JOIN lists l ON c.list_id = l.id WHERE c.id = ?', [cardId]);
    if (cardData.length === 0) {
      console.log(`- [DEBUG] FALLO: No se encontró la tarjeta con id ${cardId}.`);
      return res.status(404).json({ message: 'Tarjeta no encontrada.' });
    }
    const boardId = cardData[0].board_id;
    console.log(`- [DEBUG] La tarjeta pertenece al tablero (boardId): ${boardId}`);
    
    const [memberRows] = await pool.query('SELECT user_id FROM board_members WHERE board_id = ? AND user_id = ?', [boardId, requesterId]);
    if (memberRows.length === 0) {
      console.log(`- [DEBUG] FALLO: El usuario que pide (${requesterId}) no es miembro y no puede quitar asignaciones.`);
      return res.status(403).json({ message: 'No tienes permiso para quitar miembros en este tablero.' });
    }

    console.log('- [DEBUG] ÉXITO: Verificación de permiso pasada.');
    const [result] = await pool.query('DELETE FROM card_assignees WHERE card_id = ? AND user_id = ?', [cardId, userIdToRemove]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Miembro eliminado de la tarjeta exitosamente.' });
    } else {
      res.status(404).json({ message: 'La asignación no existía.' });
    }
    
  } catch (error) {
    console.error("--- [DEBUG] ERROR INESPERADO ---", error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};



