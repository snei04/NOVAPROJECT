import pool from '../config/database.js';
import CardService from '../services/card.service.js';
import { sendMail } from '../services/mail.service.js';

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
  try {
    console.log('--- [DEBUG] Iniciando updateCard ---');
    const { id } = req.params;
    const updates = req.body;
    const user = req.user;
    const userRole = req.boardRole; // Obtenido del middleware isBoardMember

    console.log(`--- [DEBUG] Rol del usuario: '${userRole}'`);
    console.log(`--- [DEBUG] Intentando actualizar la tarjeta ${id} con:`, updates);

    // --- LÓGICA DE PERMISOS ---
    if (userRole !== 'owner') {
      console.log("--- [DEBUG] El usuario no es 'owner'. Verificando permisos de miembro...");
      
      const allowedUpdatesForMember = ['description', 'isCompleted']; // Campos que un miembro puede editar
      const requestedUpdates = Object.keys(updates);
  

      console.log(`--- [DEBUG] Campos permitidos para miembros: [${allowedUpdatesForMember.join(', ')}]`);
      console.log(`--- [DEBUG] Campos solicitados: [${requestedUpdates.join(', ')}]`);

      const isUpdateAllowed = requestedUpdates.every(key => allowedUpdatesForMember.includes(key));
      
      if (!isUpdateAllowed) {
        console.log('--- [DEBUG] ACCESO DENEGADO: El miembro intenta actualizar campos no permitidos.');
        return res.status(403).json({ message: 'Como miembro, solo puedes actualizar la descripción.' });
      }
      
      console.log('--- [DEBUG] PERMISO CONCEDIDO: El miembro solo está actualizando campos permitidos.');
    } else {
      console.log("--- [DEBUG] PERMISO CONCEDIDO: El usuario es 'owner'.");
    }
    // --- FIN DE LA LÓGICA DE PERMISOS ---

    await CardService.updateCard(id, updates, user);
    console.log('--- [DEBUG] CardService.updateCard ejecutado exitosamente.');
    
    res.status(200).json({ message: 'Tarjeta actualizada exitosamente' });

  } catch (error) {
    console.error('--- [DEBUG] ERROR FATAL en updateCard ---', error);
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

  try {
    // 2. Se obtienen todos los datos necesarios al principio
    const [userRows] = await pool.query('SELECT email, nombre FROM usuarios WHERE id = ?', [userIdToAssign]);
    if (userRows.length === 0) {
      return res.status(404).json({ message: 'El usuario que intentas asignar no existe.' });
    }
    const userToAssign = userRows[0];

    const [cardDetailsRows] = await pool.query(`
      SELECT c.title as cardTitle, b.id as boardId, b.title as boardTitle
      FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      WHERE c.id = ?
    `, [cardId]);
    if (cardDetailsRows.length === 0) {
      return res.status(404).json({ message: 'La tarjeta no existe.' });
    }
    const cardDetails = cardDetailsRows[0];
    const boardId = cardDetails.boardId;

    // Lógica de permisos (se mantiene igual)
    const [memberRows] = await pool.query('SELECT user_id FROM board_members WHERE board_id = ?', [boardId]);
    const memberIds = memberRows.map(m => m.user_id);
    if (!memberIds.includes(Number(requesterId)) || !memberIds.includes(Number(userIdToAssign))) {
        return res.status(403).json({ message: 'Ambos usuarios deben ser miembros del tablero.' });
    }

    // Asignar miembro
    await pool.query('INSERT INTO card_assignees (card_id, user_id) VALUES (?, ?)', [cardId, userIdToAssign]);

    // 3. Se añade la lógica para enviar el correo de notificación
    const taskLink = `http://localhost:4200/app/boards/${boardId}`;
    const emailHtml = `
      <h1>Nueva Tarea Asignada</h1>
      <p>Hola ${userToAssign.nombre},</p>
      <p>Se te ha asignado la tarea "<b>${cardDetails.cardTitle}</b>" en el tablero "<b>${cardDetails.boardTitle}</b>".</p>
      <a href="${taskLink}" style="padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Ver Tablero</a>
    `;
    sendMail(userToAssign.email, `Se te ha asignado una nueva tarea: "${cardDetails.cardTitle}"`, emailHtml);

    res.status(201).json({ message: 'Miembro asignado a la tarjeta exitosamente.' });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Este usuario ya está asignado a la tarjeta.' });
    }
    console.error("--- ERROR INESPERADO ---", error);
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



