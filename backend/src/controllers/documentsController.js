import pool from '../config/database.js';
import crypto from 'crypto';
import { sendMail } from '../services/mail.service.js';

/**
 * Obtener todos los documentos del usuario (propios o compartidos)
 */
export const getAllDocuments = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    
    if (!userId) {
        // Fallback for legacy/public access if protection not fully enabled yet
        // But we should prefer secure access
        return res.status(401).json({ message: 'No autorizado' });
    }

    const [documents] = await pool.query(
      `SELECT 
        d.id, 
        d.title, 
        d.content, 
        d.icon, 
        d.parent_id as parentId, 
        d.is_archived as isArchived,
        d.created_at as createdAt, 
        d.updated_at as updatedAt,
        dm.role as myRole
      FROM documents d
      JOIN document_members dm ON d.id = dm.document_id
      WHERE d.is_archived = FALSE AND dm.user_id = ?
      ORDER BY d.created_at DESC`,
      [userId]
    );

    res.json(documents);
  } catch (error) {
    console.error('Error obteniendo documentos:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: 'GET_DOCUMENTS_ERROR',
        message: 'Error al obtener documentos'
      }
    });
  }
};

/**
 * Invitar a un colaborador a un documento
 */
export const inviteCollaborator = async (req, res) => {
    try {
        const { id } = req.params; // Document ID
        const { email, role = 'editor' } = req.body;
        const inviter = req.user;

        if (!email) {
            return res.status(400).json({ message: 'Email requerido' });
        }

        // 1. Verificar si el documento existe y si el usuario tiene permiso
        // (Por simplicidad, cualquier miembro actual puede invitar, o solo owners/editors. 
        // Asumimos que quien llama tiene acceso si pasó el middleware y verificamos membresía)
        const [membership] = await pool.query(
            'SELECT role FROM document_members WHERE document_id = ? AND user_id = ?',
            [id, inviter.id]
        );

        if (membership.length === 0) {
            return res.status(403).json({ message: 'No tienes permiso para invitar a este documento' });
        }

        // 2. Buscar usuario destino
        const [users] = await pool.query('SELECT id, nombre FROM usuarios WHERE email = ?', [email]);

        const [docInfo] = await pool.query('SELECT title FROM documents WHERE id = ?', [id]);
        const docTitle = docInfo[0]?.title || 'Documento sin título';
        const docLink = `http://localhost:4200/app/documents/${id}`;

        if (users.length === 0) {
            // Usuario no existe -> Enviar invitación por correo
            await sendMail(email, `Invitación a editar documento: ${docTitle}`, `
                <h1>Has sido invitado a colaborar</h1>
                <p>${inviter.nombre} te ha invitado a colaborar en el documento <b>"${docTitle}"</b>.</p>
                <p>Por favor regístrate en NovaProject para acceder:</p>
                <a href="http://localhost:4200/register">Registrarse</a>
            `);
            return res.status(200).json({ message: 'Usuario no registrado. Se envió una invitación por correo.' });
        }

        const userToInvite = users[0];

        // 3. Verificar si ya es miembro
        const [existingMember] = await pool.query(
            'SELECT * FROM document_members WHERE document_id = ? AND user_id = ?',
            [id, userToInvite.id]
        );

        if (existingMember.length > 0) {
            return res.status(409).json({ message: 'El usuario ya es colaborador de este documento' });
        }

        // 4. Agregar miembro
        await pool.query(
            'INSERT INTO document_members (document_id, user_id, role) VALUES (?, ?, ?)',
            [id, userToInvite.id, role]
        );

        // 5. Notificar
        await sendMail(email, `Colaboración en documento: ${docTitle}`, `
            <h1>Tienes acceso a un nuevo documento</h1>
            <p>${inviter.nombre} te ha invitado a colaborar en <b>"${docTitle}"</b>.</p>
            <a href="${docLink}">Abrir Documento</a>
        `);

        res.status(200).json({ message: 'Colaborador añadido exitosamente' });

    } catch (error) {
        console.error('Error invitando colaborador:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

/**
 * Obtener un documento específico por ID
 */
export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    if (!userId) return res.status(401).json({ message: 'No autorizado' });

    const [documents] = await pool.query(
      `SELECT 
        d.id, 
        d.title, 
        d.content, 
        d.icon, 
        d.parent_id as parentId, 
        d.is_archived as isArchived,
        d.created_at as createdAt, 
        d.updated_at as updatedAt,
        dm.role as myRole
      FROM documents d
      JOIN document_members dm ON d.id = dm.document_id
      WHERE d.id = ? AND d.is_archived = FALSE AND dm.user_id = ?`,
      [id, userId]
    );

    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: {
          code: 'DOCUMENT_NOT_FOUND',
          message: 'Documento no encontrado o no tienes acceso'
        }
      });
    }

    res.json(documents[0]);
  } catch (error) {
    console.error('Error obteniendo documento:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: 'GET_DOCUMENT_ERROR',
        message: 'Error al obtener documento'
      }
    });
  }
};

/**
 * Crear un nuevo documento
 */
export const createDocument = async (req, res) => {
  try {
    const { title = 'Sin título', parentId = null, icon = null } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!userId) return res.status(401).json({ message: 'No autorizado' });

    const defaultContent = {
      type: 'doc',
      content: [],
      databases: []
    };

    const docId = crypto.randomUUID();

    // 1. Insertar documento
    await pool.query(
      `INSERT INTO documents (id, title, content, icon, parent_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [docId, title, JSON.stringify(defaultContent), icon, parentId]
    );

    // 2. Asignar creador como owner
    await pool.query(
        'INSERT INTO document_members (document_id, user_id, role) VALUES (?, ?, ?)',
        [docId, userId, 'owner']
    );

    const [newDocument] = await pool.query(
      `SELECT 
        id, 
        title, 
        content, 
        icon, 
        parent_id as parentId, 
        is_archived as isArchived,
        created_at as createdAt, 
        updated_at as updatedAt
      FROM documents 
      WHERE id = ?`,
      [docId]
    );
    
    // Add role to response manually since we know it's owner
    const response = { ...newDocument[0], myRole: 'owner' };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creando documento:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: 'CREATE_DOCUMENT_ERROR',
        message: 'Error al crear documento'
      }
    });
  }
};

/**
 * Actualizar un documento existente
 */
export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, icon, isArchived } = req.body;

    // Construir la consulta dinámicamente
    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }

    if (content !== undefined) {
      updates.push('content = ?');
      values.push(JSON.stringify(content));
    }

    if (icon !== undefined) {
      updates.push('icon = ?');
      values.push(icon);
    }

    if (isArchived !== undefined) {
      updates.push('is_archived = ?');
      values.push(isArchived);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          code: 'NO_UPDATES',
          message: 'No hay campos para actualizar'
        }
      });
    }

    values.push(id);

    await pool.query(
      `UPDATE documents SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const [updatedDocument] = await pool.query(
      `SELECT 
        id, 
        title, 
        content, 
        icon, 
        parent_id as parentId, 
        is_archived as isArchived,
        created_at as createdAt, 
        updated_at as updatedAt
      FROM documents 
      WHERE id = ?`,
      [id]
    );

    if (updatedDocument.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: {
          code: 'DOCUMENT_NOT_FOUND',
          message: 'Documento no encontrado'
        }
      });
    }

    res.json(updatedDocument[0]);
  } catch (error) {
    console.error('Error actualizando documento:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: 'UPDATE_DOCUMENT_ERROR',
        message: 'Error al actualizar documento'
      }
    });
  }
};

/**
 * Archivar un documento (soft delete)
 */
export const archiveDocument = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'UPDATE documents SET is_archived = TRUE WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      data: null,
      error: null
    });
  } catch (error) {
    console.error('Error archivando documento:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: 'ARCHIVE_DOCUMENT_ERROR',
        message: 'Error al archivar documento'
      }
    });
  }
};

/**
 * Obtener documentos hijos de un documento padre
 */
export const getChildDocuments = async (req, res) => {
  try {
    const { parentId } = req.params;

    const [documents] = await pool.query(
      `SELECT 
        id, 
        title, 
        content, 
        icon, 
        parent_id as parentId, 
        is_archived as isArchived,
        created_at as createdAt, 
        updated_at as updatedAt
      FROM documents 
      WHERE parent_id = ? AND is_archived = FALSE 
      ORDER BY created_at DESC`,
      [parentId]
    );

    res.json(documents);
  } catch (error) {
    console.error('Error obteniendo documentos hijos:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: 'GET_CHILD_DOCUMENTS_ERROR',
        message: 'Error al obtener documentos hijos'
      }
    });
  }
};
