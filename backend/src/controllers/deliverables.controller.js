import fs from 'fs';
import pool from '../config/database.js';

export const getDeliverablesByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const [deliverables] = await pool.query(
      'SELECT * FROM deliverables WHERE project_id = ? ORDER BY due_date ASC',
      [projectId]
    );
    res.json(deliverables);
  } catch (error) {
    console.error('Error obteniendo entregables:', error);
    res.status(500).json({ message: 'Error al obtener entregables' });
  }
};

export const createDeliverable = async (req, res) => {
  try {
    const { projectId, title, description, dueDate, type, evidenceLink } = req.body;

    if (!projectId || !title || !dueDate) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    const [result] = await pool.query(
      'INSERT INTO deliverables (project_id, title, description, due_date, type, evidence_link, status, progress) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [projectId, title, description, dueDate, type || 'document', evidenceLink, 'pending', 0]
    );

    const [newDeliverable] = await pool.query('SELECT * FROM deliverables WHERE id = ?', [result.insertId]);
    res.status(201).json(newDeliverable[0]);
  } catch (error) {
    console.error('Error creando entregable:', error);
    res.status(500).json({ message: 'Error al crear entregable' });
  }
};

export const updateDeliverable = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allowedFields = ['title', 'description', 'due_date', 'status', 'type', 'progress', 'evidence_link'];
    const fields = [];
    const values = [];

    for (const key of Object.keys(updates)) {
        let dbField = key;
        if (key === 'dueDate') dbField = 'due_date';
        if (key === 'evidenceLink') dbField = 'evidence_link';
        
        let value = updates[key];

        // Conversión segura para progress
        if (key === 'progress') {
            value = Number(value);
            if (isNaN(value)) continue;
        }

        // Conversión segura para fechas (MySQL compatible)
        if (dbField === 'due_date' && typeof value === 'string') {
            // Si viene como ISO string (2025-11-22T05:00:00.000Z), lo cortamos
            if (value.includes('T')) {
                value = value.slice(0, 19).replace('T', ' ');
            }
        }

        if (allowedFields.includes(dbField)) {
            fields.push(`${dbField} = ?`);
            values.push(value);
        }
    }

    if (fields.length === 0) return res.status(400).json({ message: 'Nada que actualizar' });

    values.push(id);
    await pool.query(`UPDATE deliverables SET ${fields.join(', ')} WHERE id = ?`, values);

    const [updated] = await pool.query('SELECT * FROM deliverables WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Error actualizando entregable:', error);
    res.status(500).json({ message: 'Error al actualizar entregable' });
  }
};

export const deleteDeliverable = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM deliverables WHERE id = ?', [id]);
    res.json({ message: 'Entregable eliminado' });
  } catch (error) {
    console.error('Error eliminando entregable:', error);
    res.status(500).json({ message: 'Error al eliminar entregable' });
  }
};
