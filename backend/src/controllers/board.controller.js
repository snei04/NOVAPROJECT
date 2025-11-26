// src/controllers/board.controller.js
import pool from '../config/database.js';
import BoardService from '../services/board.service.js'; // <-- 1. Importa el servicio
import { sendMail } from '../services/mail.service.js';

export const createBoard = async (req, res) => {
  try {
    console.log('Create Board Request:', { body: req.body, user: req.user });
    const { title, backgroundColor, generalObjective, scopeDefinition, specificObjectives } = req.body;
    const userId = req.user.id;

    if (!title || !backgroundColor) {
      return res.status(400).json({ message: 'El título y el color de fondo son requeridos' });
    }

    // Validación de campos de gobernanza (Mejora 4)
    if (!generalObjective || !scopeDefinition || !specificObjectives) {
        return res.status(400).json({ 
            message: 'Los campos de gobernanza (Objetivo General, Alcance, Objetivos Específicos) son obligatorios.' 
        });
    }

    // 2. El controlador ahora solo llama al servicio
    const newBoard = await BoardService.createBoard({ 
        title, 
        backgroundColor, 
        userId,
        generalObjective,
        scopeDefinition,
        specificObjectives
    });

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
    const [boards] = await pool.query(`
      SELECT DISTINCT b.*, 
        CASE 
          WHEN b.user_id = ? THEN 'owner'
          ELSE bm.role 
        END as userRole
      FROM boards b
      LEFT JOIN board_members bm ON b.id = bm.board_id
      WHERE b.user_id = ? OR bm.user_id = ?
    `, [userId, userId, userId]);
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
        
        const board = await BoardService.getFullBoardDetails(id);
        
        if (!board) {
             return res.status(404).json({ message: 'Tablero no encontrado.' });
        }

        const [userRoleRows] = await pool.query(
          'SELECT role FROM board_members WHERE board_id = ? AND user_id = ?',
          [id, userId]
        );
        if (userRoleRows.length > 0) {
          board.userRole = userRoleRows[0].role;
        } else if (board.user_id === userId) {
          board.userRole = 'owner';
        }

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

    const [userToInviteRows] = await pool.query('SELECT id, nombre, email FROM usuarios WHERE email = ?', [email]);
    
    // --- 3. Lógica para enviar el correo de invitación ---
    const inviteLink = `http://localhost:4200/app/boards/${boardId}`;
    const registerLink = `http://localhost:4200/register`;

    if (userToInviteRows.length === 0) {
      // Usuario no existe: Enviar invitación para registrarse
      const emailHtml = `
        <h1>¡Has sido invitado a colaborar en NovaProject!</h1>
        <p>Hola,</p>
        <p>El usuario <b>${owner.nombre}</b> te ha invitado a colaborar en el tablero "<b>${boardTitle}</b>".</p>
        <p>Aún no tienes una cuenta. Regístrate para acceder:</p>
        <a href="${registerLink}" style="padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Registrarse</a>
      `;
      await sendMail(email, `Invitación para colaborar en "${boardTitle}"`, emailHtml);
      return res.status(200).json({ message: 'Usuario no registrado. Se ha enviado una invitación por correo.' });
    }

    const userToInviteId = userToInviteRows[0].id;
    const userToInviteName = userToInviteRows[0].nombre;

    await pool.query('INSERT INTO board_members (board_id, user_id, role) VALUES (?, ?, ?)', [boardId, userToInviteId, 'member']);

    // --- CREACIÓN AUTOMÁTICA DE STAKEHOLDER ---
    try {
      // Verificamos si ya existe como stakeholder en este proyecto (tablero)
      // Nota: Asumimos contact_info contiene el email para identificarlo
      const [existingStakeholder] = await pool.query(
        `SELECT id FROM stakeholders WHERE project_id = ? AND JSON_EXTRACT(contact_info, '$.email') = ?`,
        [boardId, email]
      );

      if (existingStakeholder.length === 0) {
        await pool.query(
          `INSERT INTO stakeholders (project_id, name, role, priority, contact_info)
           VALUES (?, ?, ?, ?, ?)`,
          [
            boardId, 
            userToInviteName, 
            'Collaborator', // Rol por defecto
            'medium', 
            JSON.stringify({ email: email, isSystemUser: true, userId: userToInviteId })
          ]
        );
        console.log(`[AUTO] Stakeholder creado para usuario ${email} en tablero ${boardId}`);
      }
    } catch (stakeholderError) {
      console.error('[AUTO] Error al crear stakeholder automático (no crítico):', stakeholderError);
      // No fallamos la petición principal si esto falla
    }
    // -------------------------------------------

    // Enviar correo de acceso directo si ya existe
    const emailHtml = `
      <h1>¡Has sido invitado a un tablero!</h1>
      <p>Hola ${userToInviteName},</p>
      <p>El usuario <b>${owner.nombre}</b> te ha invitado a colaborar en el tablero "<b>${boardTitle}</b>" en Novaproject.</p>
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
