import pool from '../config/database.js';
import crypto from 'crypto';
import { sendMail } from '../services/mail.service.js';

/**
 * Invitar a un stakeholder al sistema (Vincular con usuario)
 */
export const inviteStakeholder = async (req, res) => {
  try {
    const { id } = req.params; // Stakeholder ID
    const { email } = req.body; // Optional override, otherwise use stored email

    // 1. Obtener stakeholder
    const [stakeholderRows] = await pool.query('SELECT * FROM stakeholders WHERE id = ?', [id]);
    if (stakeholderRows.length === 0) {
      return res.status(404).json({ message: 'Stakeholder no encontrado' });
    }
    const stakeholder = stakeholderRows[0];
    
    // 2. Determinar email
    let targetEmail = email;
    if (!targetEmail && stakeholder.contact_info) {
        // Handle both string and object JSON
        const contact = typeof stakeholder.contact_info === 'string' 
            ? JSON.parse(stakeholder.contact_info) 
            : stakeholder.contact_info;
        targetEmail = contact.email;
    }

    if (!targetEmail) {
        return res.status(400).json({ message: 'No hay email asociado al stakeholder. Proporcione uno.' });
    }

    // 3. Buscar usuario
    const [userRows] = await pool.query('SELECT id, nombre FROM usuarios WHERE email = ?', [targetEmail]);
    
    if (userRows.length === 0) {
        // Caso: Usuario no existe. Enviamos correo de invitación para registrarse.
        const registerLink = 'http://localhost:4200/register'; // Ajustar según frontend
        await sendMail(targetEmail, 'Invitación a NovaProject', `
            <h1>Bienvenido a NovaProject</h1>
            <p>Has sido identificado como interesado en el proyecto <b>${stakeholder.name}</b>.</p>
            <p>Por favor regístrate para acceder y colaborar:</p>
            <a href="${registerLink}">Registrarse</a>
        `);
        return res.status(200).json({ message: 'Usuario no registrado. Se ha enviado un correo de invitación.' });
    }

    const user = userRows[0];

    // 4. Vincular usuario al stakeholder
    await pool.query('UPDATE stakeholders SET user_id = ? WHERE id = ?', [user.id, id]);

    // 5. Dar acceso al tablero (Project)
    // Verificar si ya es miembro
    const [memberRows] = await pool.query(
        'SELECT * FROM board_members WHERE board_id = ? AND user_id = ?',
        [stakeholder.project_id, user.id]
    );

    if (memberRows.length === 0) {
        await pool.query(
            'INSERT INTO board_members (board_id, user_id, role) VALUES (?, ?, ?)',
            [stakeholder.project_id, user.id, 'stakeholder']
        );
    } else {
        // Opcional: Actualizar rol si es necesario, pero mejor no degradar permisos si ya era admin
        // Si es 'observer' o algo menor, quizás subirlo? Lo dejamos así por ahora.
    }

    // 6. Notificar
    const dashboardLink = `http://localhost:4200/app/boards/${stakeholder.project_id}`;
    await sendMail(targetEmail, 'Acceso concedido a NovaProject', `
        <h1>Tienes acceso al proyecto</h1>
        <p>Hola ${user.nombre},</p>
        <p>Ahora tienes acceso como Stakeholder al proyecto. Puedes revisar entregables y actualizar riesgos.</p>
        <a href="${dashboardLink}">Ir al Tablero</a>
    `);

    res.status(200).json({ message: 'Stakeholder vinculado y acceso concedido exitosamente.' });

  } catch (error) {
    console.error('Error invitando stakeholder:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * Obtener todos los stakeholders de un proyecto
 */
export const getStakeholdersByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const [stakeholders] = await pool.query(
      `SELECT 
        id, 
        project_id as projectId,
        name,
        role,
        priority,
        contact_info as contactInfo,
        availability,
        created_at as createdAt,
        updated_at as updatedAt
      FROM stakeholders 
      WHERE project_id = ?
      ORDER BY 
        CASE priority 
          WHEN 'high' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 3 
        END`,
      [projectId]
    );

    // Simplificación: Devolver array directo para compatibilidad
    res.json(stakeholders);
    /*
    res.json({
      success: true,
      data: stakeholders,
      error: null
    });
    */
  } catch (error) {
    console.error('Error obteniendo stakeholders:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: 'GET_STAKEHOLDERS_ERROR',
        message: 'Error al obtener stakeholders'
      }
    });
  }
};

/**
 * Obtener disponibilidad de un stakeholder
 */
export const getStakeholderAvailability = async (req, res) => {
  try {
    const { stakeholderId } = req.params;

    const [availability] = await pool.query(
      `SELECT 
        id,
        stakeholder_id as stakeholderId,
        day_of_week as dayOfWeek,
        start_time as startTime,
        end_time as endTime,
        is_active as isActive
      FROM stakeholder_availability 
      WHERE stakeholder_id = ? AND is_active = TRUE
      ORDER BY day_of_week`,
      [stakeholderId]
    );

    res.json(availability);
    /*
    res.json({
      success: true,
      data: availability,
      error: null
    });
    */
  } catch (error) {
    console.error('Error obteniendo disponibilidad:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: 'GET_AVAILABILITY_ERROR',
        message: 'Error al obtener disponibilidad'
      }
    });
  }
};

/**
 * Añadir disponibilidad a un stakeholder
 */
export const addStakeholderAvailability = async (req, res) => {
  try {
    const { stakeholderId } = req.params;
    const { dayOfWeek, startTime, endTime } = req.body;

    console.log(`[DEBUG] addStakeholderAvailability - ID: ${stakeholderId}`, req.body);

    if (dayOfWeek === undefined || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'dayOfWeek, startTime y endTime son requeridos'
        }
      });
    }

    const id = crypto.randomUUID();

    await pool.query(
      `INSERT INTO stakeholder_availability (id, stakeholder_id, day_of_week, start_time, end_time)
       VALUES (?, ?, ?, ?, ?)`,
      [id, stakeholderId, dayOfWeek, startTime, endTime]
    );

    const [newAvailability] = await pool.query(
      `SELECT 
        id,
        stakeholder_id as stakeholderId,
        day_of_week as dayOfWeek,
        start_time as startTime,
        end_time as endTime,
        is_active as isActive
      FROM stakeholder_availability 
      WHERE id = ?`,
      [id]
    );

    res.status(201).json({
      success: true,
      data: newAvailability[0],
      error: null
    });
  } catch (error) {
    console.error('Error añadiendo disponibilidad:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: 'ADD_AVAILABILITY_ERROR',
        message: 'Error al añadir disponibilidad'
      }
    });
  }
};

/**
 * Actualizar disponibilidad (Reemplazar para el día)
 */
export const updateStakeholderAvailability = async (req, res) => {
  try {
    const { stakeholderId } = req.params;
    const { dayOfWeek, startTime, endTime } = req.body;

    console.log(`[DEBUG] updateStakeholderAvailability - ID: ${stakeholderId}`, req.body);

    if (dayOfWeek === undefined || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'dayOfWeek, startTime y endTime son requeridos'
        }
      });
    }

    // 1. Eliminar disponibilidades existentes para ese día (estrategia de reemplazo)
    await pool.query(
      'DELETE FROM stakeholder_availability WHERE stakeholder_id = ? AND day_of_week = ?',
      [stakeholderId, dayOfWeek]
    );

    // 2. Crear nueva disponibilidad
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO stakeholder_availability (id, stakeholder_id, day_of_week, start_time, end_time)
       VALUES (?, ?, ?, ?, ?)`,
      [id, stakeholderId, dayOfWeek, startTime, endTime]
    );

    const [newAvailability] = await pool.query(
      `SELECT 
        id,
        stakeholder_id as stakeholderId,
        day_of_week as dayOfWeek,
        start_time as startTime,
        end_time as endTime,
        is_active as isActive
      FROM stakeholder_availability 
      WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: newAvailability[0],
      error: null
    });

  } catch (error) {
    console.error('Error actualizando disponibilidad:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: 'UPDATE_AVAILABILITY_ERROR',
        message: 'Error al actualizar disponibilidad'
      }
    });
  }
};

/**
 * Obtener reuniones de un proyecto
 */
export const getMeetingsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.query;

    let query = `
      SELECT 
        id, 
        project_id as projectId,
        title,
        start_time as startTime,
        end_time as endTime,
        status,
        created_at as createdAt
      FROM meetings 
      WHERE project_id = ?
    `;

    const params = [projectId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY start_time ASC';

    const [meetings] = await pool.query(query, params);

    // Cargar action_items (Compromisos) para estas reuniones
    if (meetings.length > 0) {
      const meetingIds = meetings.map(m => m.id);
      // En mysql2, para IN (?), pasar array simple funciona si meetingIds no está vacío
      const [actionItems] = await pool.query(
        `SELECT 
          id,
          meeting_id as meetingId,
          description,
          status,
          due_date as dueDate
         FROM action_items 
         WHERE meeting_id IN (?)`,
        [meetingIds]
      );

      meetings.forEach(meeting => {
        meeting.actionItems = actionItems.filter(item => item.meetingId === meeting.id);
      });
    }

    res.json(meetings);
    /*
    res.json({
      success: true,
      data: meetings,
      error: null
    });
    */
  } catch (error) {
    console.error('Error obteniendo reuniones:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: 'GET_MEETINGS_ERROR',
        message: 'Error al obtener reuniones'
      }
    });
  }
};

/**
 * Crear una nueva reunión
 */
export const createMeeting = async (req, res) => {
  try {
    const { projectId, title, startTime, endTime } = req.body;

    if (!projectId || !title || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'projectId, title, startTime y endTime son requeridos'
        }
      });
    }

    const id = crypto.randomUUID();

    await pool.query(
      `INSERT INTO meetings (id, project_id, title, start_time, end_time)
       VALUES (?, ?, ?, ?, ?)`,
      [id, projectId, title, startTime, endTime]
    );

    const [newMeeting] = await pool.query(
      `SELECT 
        id, 
        project_id as projectId,
        title,
        start_time as startTime,
        end_time as endTime,
        status,
        created_at as createdAt
      FROM meetings 
      WHERE id = ?`,
      [id]
    );

    res.status(201).json({
      success: true,
      data: newMeeting[0],
      error: null
    });
  } catch (error) {
    console.error('Error creando reunión:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: 'CREATE_MEETING_ERROR',
        message: 'Error al crear reunión'
      }
    });
  }
};

/**
 * Actualizar estado de reunión
 */
export const updateMeetingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'status es requerido'
        }
      });
    }

    await pool.query(
      'UPDATE meetings SET status = ? WHERE id = ?',
      [status, id]
    );

    const [updatedMeeting] = await pool.query(
      `SELECT 
        id, 
        project_id as projectId,
        title,
        start_time as startTime,
        end_time as endTime,
        status
      FROM meetings 
      WHERE id = ?`,
      [id]
    );

    if (updatedMeeting.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: {
          code: 'MEETING_NOT_FOUND',
          message: 'Reunión no encontrada'
        }
      });
    }

    res.json({
      success: true,
      data: updatedMeeting[0],
      error: null
    });
  } catch (error) {
    console.error('Error actualizando reunión:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: 'UPDATE_MEETING_ERROR',
        message: 'Error al actualizar reunión'
      }
    });
  }
};

/**
 * Buscar slots óptimos para reunión
 */
export const findOptimalSlots = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { stakeholderIds, duration = 60, daysAhead = 14 } = req.body;

    if (!stakeholderIds || stakeholderIds.length === 0) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'stakeholderIds es requerido'
        }
      });
    }

    // Obtener disponibilidad de todos los stakeholders
    const placeholders = stakeholderIds.map(() => '?').join(',');
    const [availability] = await pool.query(
      `SELECT 
        stakeholder_id as stakeholderId,
        day_of_week as dayOfWeek,
        start_time as startTime,
        end_time as endTime
      FROM stakeholder_availability 
      WHERE stakeholder_id IN (${placeholders}) AND is_active = TRUE`,
      stakeholderIds
    );

    // Algoritmo simple: encontrar días donde todos están disponibles
    const availabilityByDay = {};
    availability.forEach(slot => {
      if (!availabilityByDay[slot.dayOfWeek]) {
        availabilityByDay[slot.dayOfWeek] = [];
      }
      availabilityByDay[slot.dayOfWeek].push(slot);
    });

    const optimalSlots = [];
    const today = new Date();

    // Buscar slots en los próximos días
    for (let i = 1; i <= daysAhead; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay();

      if (availabilityByDay[dayOfWeek]) {
        const slotsForDay = availabilityByDay[dayOfWeek];
        
        // Si todos los stakeholders tienen disponibilidad ese día
        if (slotsForDay.length === stakeholderIds.length) {
          // Encontrar horario común
          const startTimes = slotsForDay.map(s => s.startTime);
          const endTimes = slotsForDay.map(s => s.endTime);
          
          const latestStart = startTimes.sort().reverse()[0];
          const earliestEnd = endTimes.sort()[0];

          if (latestStart < earliestEnd) {
            const startDateTime = new Date(date);
            const [startHour, startMinute] = latestStart.split(':');
            startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

            const endDateTime = new Date(startDateTime);
            endDateTime.setMinutes(endDateTime.getMinutes() + duration);

            optimalSlots.push({
              id: crypto.randomUUID(),
              startTime: startDateTime,
              endTime: endDateTime,
              availableStakeholders: stakeholderIds,
              score: 100, // Score simple: 100 si todos están disponibles
              reasons: ['Todos los stakeholders disponibles', 'Horario laboral']
            });
          }
        }
      }
    }

    res.json({
      success: true,
      data: optimalSlots.slice(0, 5), // Top 5 slots
      error: null
    });
  } catch (error) {
    console.error('Error buscando slots óptimos:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: 'FIND_SLOTS_ERROR',
        message: 'Error al buscar slots óptimos'
      }
    });
  }
};

/**
 * Crear un nuevo Stakeholder
 */
export const createStakeholder = async (req, res) => {
  try {
    const { projectId, name, role, email, priority, contactInfo } = req.body;

    if (!projectId || !name || !role) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'projectId, name y role son requeridos'
        }
      });
    }

    // Verificar si ya existe un usuario con ese email para vincular datos (opcional)
    // Por ahora guardamos el contacto en el JSON contact_info
    const contactData = contactInfo || { email: email || '' };
    
    // Insertar en la tabla stakeholders
    // Nota: priority es enum('high','medium','low'), default 'medium'
    const [result] = await pool.query(
      `INSERT INTO stakeholders (project_id, name, role, priority, contact_info)
       VALUES (?, ?, ?, ?, ?)`,
      [projectId, name, role, priority || 'medium', JSON.stringify(contactData)]
    );

    const newId = result.insertId;

    // Retornar el stakeholder creado
    const [rows] = await pool.query(
      `SELECT 
        id, 
        project_id as projectId,
        name,
        role,
        priority,
        contact_info as contactInfo,
        created_at as createdAt
      FROM stakeholders WHERE id = ?`,
      [newId]
    );

    res.status(201).json({
      success: true,
      data: rows[0],
      error: null
    });

  } catch (error) {
    console.error('Error creando stakeholder:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: 'CREATE_STAKEHOLDER_ERROR',
        message: 'Error al crear stakeholder'
      }
    });
  }
};

/**
 * Obtener TODOS los stakeholders visibles para el usuario
 * (De todos los proyectos donde es miembro)
 */
export const getAllStakeholders = async (req, res) => {
  try {
    // req.user viene del middleware protect, pero permitimos fallback para debug
    const userId = req.user?.id || 1;

    console.log(`[DEBUG] getAllStakeholders para UserID: ${userId}`);

    const [stakeholders] = await pool.query(
      `SELECT 
        s.id, 
        s.project_id as projectId,
        b.title as projectName,
        s.name,
        s.role,
        s.priority,
        s.contact_info as contactInfo,
        s.availability,
        s.created_at as createdAt,
        s.updated_at as updatedAt
      FROM stakeholders s
      JOIN board_members bm ON s.project_id = bm.board_id
      JOIN boards b ON s.project_id = b.id
      WHERE bm.user_id = ?
      ORDER BY b.title, s.name`,
      [userId]
    );

    res.json(stakeholders);
  } catch (error) {
    console.error('Error obteniendo todos los stakeholders:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: 'GET_ALL_STAKEHOLDERS_ERROR',
        message: 'Error al obtener listado general de stakeholders'
      }
    });
  }
};

/**
 * Crear un Compromiso (Action Item)
 */
export const createActionItem = async (req, res) => {
  try {
    const { meetingId, description, dueDate } = req.body;

    if (!meetingId || !description) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'meetingId y description son requeridos'
        }
      });
    }

    const [result] = await pool.query(
      'INSERT INTO action_items (meeting_id, description, due_date, status) VALUES (?, ?, ?, ?)',
      [meetingId, description, dueDate, 'pending']
    );

    const newItem = {
      id: result.insertId,
      meetingId,
      description,
      dueDate,
      status: 'pending'
    };

    res.status(201).json({
      success: true,
      data: newItem,
      error: null
    });
  } catch (error) {
    console.error('Error creando action item:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: 'CREATE_ACTION_ITEM_ERROR',
        message: 'Error al crear compromiso'
      }
    });
  }
};

/**
 * Actualizar estado de un Compromiso
 */
export const updateActionItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.query(
      'UPDATE action_items SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error actualizando action item:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: 'UPDATE_ACTION_ITEM_ERROR',
        message: 'Error al actualizar compromiso'
      }
    });
  }
};
