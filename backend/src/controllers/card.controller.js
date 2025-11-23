import pool from '../config/database.js';
import CardService from '../services/card.service.js';
import { sendMail } from '../services/mail.service.js';

// --- CREAR TARJETA (Solo para Dueños) ---
export const createCard = async (req, res) => {
  try {
    const { listId } = req.body;
    const userId = req.user.id;

    const [permissionRows] = await pool.query(`
      SELECT b.id
      FROM lists l
      JOIN boards b ON l.board_id = b.id
      LEFT JOIN board_members bm ON b.id = bm.board_id
      WHERE l.id = ? AND (b.user_id = ? OR bm.user_id = ?)
      LIMIT 1
    `, [listId, userId, userId]);

    if (permissionRows.length === 0) {
      return res.status(403).json({ message: 'No tienes permiso para crear tarjetas en este tablero.' });
    }

    // if (permissionRows[0].user_id !== userId) {
    //   return res.status(403).json({ message: 'Solo los dueños del tablero pueden crear tarjetas.' });
    // }

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
      
      // Eliminamos boardId si viene en los updates para evitar errores y chequeos innecesarios
      delete updates.boardId;

      // Lista RESTRINGIDA de campos permitidos para miembros
      const allowedUpdatesForMember = ['description', 'isCompleted']; 
      const requestedUpdates = Object.keys(updates);
  

      console.log(`--- [DEBUG] Campos permitidos para miembros: [${allowedUpdatesForMember.join(', ')}]`);
      console.log(`--- [DEBUG] Campos solicitados: [${requestedUpdates.join(', ')}]`);

      const isUpdateAllowed = requestedUpdates.every(key => allowedUpdatesForMember.includes(key));
      
      if (!isUpdateAllowed) {
        console.log('--- [DEBUG] ACCESO DENEGADO: El miembro intenta actualizar campos no permitidos.');
        return res.status(403).json({ message: 'Como miembro, solo puedes actualizar la descripción y marcar como completado.' });
      }
      
      console.log('--- [DEBUG] PERMISO CONCEDIDO: El miembro solo está actualizando campos permitidos.');
    } else {
      // Si es owner, también quitamos boardId por seguridad de DB
      delete updates.boardId;
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
      SELECT c.title as cardTitle, b.id as boardId, b.title as boardTitle, b.user_id as ownerId
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
    const ownerId = cardDetails.ownerId;

    // Lógica de permisos: SOLO EL DUEÑO PUEDE ASIGNAR
    if (requesterId !== ownerId) {
       // Verificamos si es "owner" en board_members también
       const [memberRoleRows] = await pool.query('SELECT role FROM board_members WHERE board_id = ? AND user_id = ?', [boardId, requesterId]);
       if (memberRoleRows.length === 0 || memberRoleRows[0].role !== 'owner') {
          return res.status(403).json({ message: 'Solo el dueño del tablero puede asignar miembros a las tarjetas.' });
       }
    }

    // Verificamos que el usuario a asignar sea miembro del tablero
    const [isMemberRows] = await pool.query('SELECT user_id FROM board_members WHERE board_id = ? AND user_id = ?', [boardId, userIdToAssign]);
    const isOwnerAssignee = (userIdToAssign === ownerId); // El dueño siempre es miembro implícito
    
    if (isMemberRows.length === 0 && !isOwnerAssignee) {
        return res.status(400).json({ message: 'El usuario debe ser miembro del tablero para ser asignado a una tarjeta.' });
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
    const [cardData] = await pool.query('SELECT l.board_id, b.user_id as ownerId FROM cards c JOIN lists l ON c.list_id = l.id JOIN boards b ON l.board_id = b.id WHERE c.id = ?', [cardId]);
    if (cardData.length === 0) {
      console.log(`- [DEBUG] FALLO: No se encontró la tarjeta con id ${cardId}.`);
      return res.status(404).json({ message: 'Tarjeta no encontrada.' });
    }
    const boardId = cardData[0].board_id;
    const ownerId = cardData[0].ownerId;
    console.log(`- [DEBUG] La tarjeta pertenece al tablero (boardId): ${boardId}`);
    
    // Lógica de permisos: SOLO EL DUEÑO PUEDE QUITAR ASIGNACIÓN
    let isAuthorized = false;
    if (requesterId === ownerId) {
        isAuthorized = true;
    } else {
        const [memberRoleRows] = await pool.query('SELECT role FROM board_members WHERE board_id = ? AND user_id = ?', [boardId, requesterId]);
        if (memberRoleRows.length > 0 && memberRoleRows[0].role === 'owner') {
            isAuthorized = true;
        }
    }

    if (!isAuthorized) {
      console.log(`- [DEBUG] FALLO: El usuario que pide (${requesterId}) no es dueño.`);
      return res.status(403).json({ message: 'Solo el dueño del tablero puede quitar miembros de las tarjetas.' });
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



