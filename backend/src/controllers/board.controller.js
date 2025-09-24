// src/controllers/board.controller.js
import pool from '../config/database.js';
import BoardService from '../services/board.service.js'; // <-- 1. Importa el servicio
import { sendMail } from '../services/mail.service.js';

export const createBoard = async (req, res) => {
  try {
    const { title, backgroundColor } = req.body;
    const userId = req.user.id;

    if (!title || !backgroundColor) {
      return res.status(400).json({ message: 'El título y el color de fondo son requeridos' });
    }

    // 2. El controlador ahora solo llama al servicio
    const newBoard = await BoardService.createBoard({ title, backgroundColor, userId });

    res.status(201).json(newBoard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor al crear el tablero' });
  }
};

// Obtener todos los tableros del usuario logueado (Ruta Protegida)
export const getMyBoards = async (req, res) => {
  const userId = req.user.id; // Obtenemos el ID del usuario del token

  try {
    const [boards] = await pool.query('SELECT * FROM boards WHERE user_id = ?', [userId]);
    res.status(200).json(boards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getBoard = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const [permissionRows] = await pool.query(`SELECT b.id FROM boards b LEFT JOIN board_members bm ON b.id = bm.board_id WHERE b.id = ? AND (b.user_id = ? OR bm.user_id = ?) LIMIT 1`, [id, userId, userId]);
        if (permissionRows.length === 0) {
            return res.status(404).json({ message: 'Tablero no encontrado o no tienes permiso para verlo.' });
        }
        
        const [boardRows] = await pool.query('SELECT * FROM boards WHERE id = ?', [id]);
        const board = boardRows[0];
        
        const [lists] = await pool.query('SELECT * FROM lists WHERE board_id = ? ORDER BY position', [id]);
        
        // Consulta explícita de todas las columnas de la tarjeta
        const [cards] = await pool.query('SELECT id, title, description, position, due_date, list_id, is_completed FROM cards WHERE list_id IN (SELECT id FROM lists WHERE board_id = ?) ORDER BY position', [id]);
        
        const [members] = await pool.query('SELECT u.id, u.nombre AS name, u.email, u.avatar FROM usuarios u INNER JOIN board_members bm ON u.id = bm.user_id WHERE bm.board_id = ?', [id]);
        const [labels] = await pool.query('SELECT l.id, l.name, l.color, cl.card_id FROM labels l INNER JOIN card_labels cl ON l.id = cl.label_id WHERE cl.card_id IN (SELECT id FROM cards WHERE list_id IN (SELECT id FROM lists WHERE board_id = ?))', [id]);
        const [assignees] = await pool.query('SELECT u.id, u.nombre as name, u.email, u.avatar, ca.card_id FROM usuarios u INNER JOIN card_assignees ca ON u.id = ca.user_id WHERE ca.card_id IN (SELECT id FROM cards WHERE list_id IN (SELECT id FROM lists WHERE board_id = ?))', [id]);

     const cardsWithDetails = cards.map(card => ({
      id: card.id,
      title: card.title,
      description: card.description,
      position: card.position,
      dueDate: card.due_date, // Aquí hacemos la traducción
      list_id: card.list_id,
       isCompleted: card.is_completed,
      labels: labels.filter(label => label.card_id === card.id),
      assignees: assignees.filter(assignee => assignee.card_id === card.id)
    }));
    const [userRoleRows] = await pool.query(
      'SELECT role FROM board_members WHERE board_id = ? AND user_id = ?',
      [id, userId]
    );
        if (userRoleRows.length > 0) {
      board.userRole = userRoleRows[0].role;
    } else if (board.user_id === userId) {
      board.userRole = 'owner';
    }
        board.lists = lists.map(list => ({
            ...list,
            cards: cardsWithDetails.filter(card => card.list_id === list.id)
        }));
        board.members = members;

        res.status(200).json(board);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; // Ej: { title, backgroundColor }

    // Aquí llamaremos al servicio para actualizar el tablero
    await BoardService.updateBoard(id, updates);
    
    res.status(200).json({ message: 'Tablero actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar el tablero:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

//Borrar un tablero
export const deleteBoard = async (req, res) => {
  const { id } = req.params; // ID del tablero a eliminar
  const userId = req.user.id;

    try {
    // Primero, verificamos que el tablero existe y pertenece al usuario
    const [boardPermissionRows] = await pool.query(`
      SELECT b.id
      FROM boards b
      LEFT JOIN board_members bm ON b.id = bm.board_id
      WHERE b.id = ? AND (b.user_id = ? OR bm.user_id = ?)
      LIMIT 1
    `, [id, userId, userId]);

    if (boardPermissionRows.length === 0) {
      return res.status(404).json({ message: 'Tablero no encontrado o no tienes permiso para verlo.' });
    }

    // Si todo está bien, procedemos a eliminarlo
    await pool.query('DELETE FROM boards WHERE id = ?', [id]);

    // Gracias a "ON DELETE CASCADE" que definimos en la base de datos,
    // todas las listas y tarjetas asociadas a este tablero se eliminarán automáticamente.

    res.status(200).json({ message: 'Tablero eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
export const addMember = async (req, res) => {
  const { boardId } = req.params;
  const { email } = req.body;
  const owner = req.user; // El usuario que invita (viene del middleware 'protect')

  if (!email) {
    return res.status(400).json({ message: 'El email del usuario a invitar es requerido' });
  }

  try {
    // 2. Modificamos la consulta para obtener también el título del tablero
    const [boardRows] = await pool.query('SELECT user_id, title FROM boards WHERE id = ?', [boardId]);
    if (boardRows.length === 0 || boardRows[0].user_id !== owner.id) {
      return res.status(403).json({ message: 'No autorizado para invitar miembros a este tablero' });
    }
    const boardTitle = boardRows[0].title; // Guardamos el título

    const [userToInviteRows] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (userToInviteRows.length === 0) {
      return res.status(404).json({ message: `No se encontró un usuario con el email: ${email}` });
    }
    const userToInviteId = userToInviteRows[0].id;

    await pool.query('INSERT INTO board_members (board_id, user_id, role) VALUES (?, ?, ?)', [boardId, userToInviteId, 'member']);

    // --- 3. Lógica para enviar el correo de invitación ---
    const inviteLink = `http://localhost:4200/app/boards/${boardId}`;
    const emailHtml = `
      <h1>¡Has sido invitado a un tablero!</h1>

      <p>Hola,</p>
      <p>El usuario <b>${owner.name}</b> te ha invitado a colaborar en el tablero "<b>${boardTitle}</b>" en Novaproject.</p>
      <a href="${inviteLink}" style="padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Ver el tablero</a>
    `;
    await sendMail(email, `Invitación para colaborar en "${boardTitle}"`, emailHtml);
    // --- Fin del envío de correo ---

    res.status(201).json({ message: 'Usuario añadido al tablero exitosamente' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'El usuario ya es miembro de este tablero' });
    }
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getBoardActivity = async (req, res) => {
    const { boardId } = req.params;
    try {
        const [activities] = await pool.query(`
            SELECT a.description, a.created_at, u.nombre as userName, u.avatar 
            FROM activities a
            JOIN usuarios u ON a.user_id = u.id
            WHERE a.board_id = ?
            ORDER BY a.created_at DESC
            LIMIT 20
        `, [boardId]);
        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const getBoardAssociations = async (req, res) => {
  try {
    console.log('--- [DEBUG] Controlador getBoardAssociations INICIADO ---');
    const { boardId } = req.params; // Usamos 'boardId' como en la ruta corregida
    
    console.log(`--- [DEBUG] Llamando al servicio getAssociations con boardId: ${boardId}`);
    const associations = await BoardService.getAssociations(boardId);
    
    console.log('--- [DEBUG] Servicio ejecutado. Enviando respuesta...');
    res.status(200).json(associations);

  } catch (error) {
    // ESTE ES EL ERROR QUE NECESITAMOS VER
    console.log('--- [DEBUG] ERROR en getBoardAssociations ---', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createBoardAssociation = async (req, res) => {
  try {
    const { boardId } = req.params; // <-- LÍNEA CORREGIDA
    const { associatedBoardId } = req.body;

    if (!associatedBoardId) {
      return res.status(400).json({ message: 'associatedBoardId es requerido en el cuerpo de la petición.' });
    }

    await BoardService.createAssociation({ boardId, associatedBoardId });
    res.status(201).json({ message: 'Tablero asociado exitosamente' });
  } catch (error) {
    if (error.statusCode === 409) {
      return res.status(409).json({ message: error.message });
    }
    console.error('Error al crear la asociación:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getDashboard = async (req, res)=> {
  try {
    // 1. Extrae el ID del tablero de la URL.
    const { id } = req.params;
    // 2. Llama al servicio para que haga el trabajo de buscar y calcular los datos.
    const dashboardData = await boardService.getDashboardData(id);
    // 3. Envía los datos obtenidos de vuelta al frontend.
    res.status(200).json(dashboardData);
  } catch (error) {
    res.status(500).json({ message: 'Error getting dashboard data.' });
  }
};
