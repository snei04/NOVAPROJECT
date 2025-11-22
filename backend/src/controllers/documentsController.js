import pool from '../config/database.js';

/**
 * Obtener todos los documentos no archivados
 */
export const getAllDocuments = async (req, res) => {
  try {
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
      WHERE is_archived = FALSE 
      ORDER BY created_at DESC`
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
 * Obtener un documento específico por ID
 */
export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

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
      WHERE id = ? AND is_archived = FALSE`,
      [id]
    );

    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: {
          code: 'DOCUMENT_NOT_FOUND',
          message: 'Documento no encontrado'
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

    const defaultContent = {
      type: 'doc',
      content: [],
      databases: []
    };

    const [result] = await pool.query(
      `INSERT INTO documents (title, content, icon, parent_id) 
       VALUES (?, ?, ?, ?)`,
      [title, JSON.stringify(defaultContent), icon, parentId]
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
      [result.insertId]
    );

    res.status(201).json(newDocument[0]);
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
