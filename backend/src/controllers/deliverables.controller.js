import fs from 'fs';
import pool from '../config/database.js';
import DeliverableService from '../services/deliverable.service.js';
import CardService from '../services/card.service.js';

export const linkBoardToDeliverable = async (req, res) => {
  try {
    const { id } = req.params; // deliverableId
    const { boardId } = req.body;

    if (!boardId) {
      return res.status(400).json({ message: 'boardId is required' });
    }

    await DeliverableService.linkBoard(id, boardId);
    res.status(200).json({ message: 'Tablero vinculado correctamente al entregable' });
  } catch (error) {
    console.error('Error linking board:', error);
    res.status(500).json({ message: 'Error al vincular el tablero' });
  }
};

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

    // --- AUTO-CREATE KANBAN CARD ---
    try {
        // 1. Get the first list of the board (usually 'To Do' or 'Pendiente')
        const [lists] = await pool.query('SELECT id FROM lists WHERE board_id = ? ORDER BY position ASC LIMIT 1', [projectId]);
        
        if (lists.length > 0) {
            const listId = lists[0].id;
            
            // 2. Calculate position (bottom of list)
            const [posRows] = await pool.query('SELECT MAX(position) as maxPos FROM cards WHERE list_id = ?', [listId]);
            const newPos = (posRows[0].maxPos || 0) + 65535;

            // 3. Create Card
            await CardService.createCard({
                title: `[Entregable] ${title}`,
                listId: listId,
                position: newPos,
                description: description, 
                dueDate: dueDate
            });
            console.log('Carta Kanban creada automáticamente para el entregable');
        }
    } catch (cardError) {
        console.error('Error al crear carta automática:', cardError);
    }
    // -------------------------------

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

export const createTaskFromDeliverable = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Get Deliverable
    const [rows] = await pool.query('SELECT * FROM deliverables WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Entregable no encontrado' });
    const deliverable = rows[0];

    // 2. Get Lists
    const boardId = deliverable.project_id;
    const [lists] = await pool.query('SELECT id, title FROM lists WHERE board_id = ?', [boardId]);

    // 3. Map Status to List Title
    let targetListTitle = '';
    if (deliverable.status === 'pending') targetListTitle = 'Pendiente';
    else if (deliverable.status === 'in_progress') targetListTitle = 'En Progreso';
    else if (deliverable.status === 'completed') targetListTitle = 'Completado';
    
    // 4. Find List
    let targetList = lists.find(l => l.title.toLowerCase() === targetListTitle.toLowerCase());

    // 5. If not found, use or create 'Sin Lista'
    if (!targetList) {
        let sinLista = lists.find(l => l.title === 'Sin Lista');
        if (!sinLista) {
            // Create 'Sin Lista'
            const [maxPos] = await pool.query('SELECT MAX(position) as maxPos FROM lists WHERE board_id = ?', [boardId]);
            const newPos = (maxPos[0].maxPos || 0) + 1000;
            const [newList] = await pool.query('INSERT INTO lists (board_id, title, position) VALUES (?, ?, ?)', [boardId, 'Sin Lista', newPos]);
            targetList = { id: newList.insertId };
        } else {
            targetList = sinLista;
        }
    }

    // 6. Create Card
    const [posRows] = await pool.query('SELECT MAX(position) as maxPos FROM cards WHERE list_id = ?', [targetList.id]);
    const newCardPos = (posRows[0].maxPos || 0) + 65535;

    await CardService.createCard({
        title: `[Entregable] ${deliverable.title}`,
        listId: targetList.id,
        position: newCardPos,
        description: deliverable.description,
        dueDate: deliverable.due_date
    });

    res.json({ message: 'Tarea creada exitosamente en el tablero', listName: targetListTitle || 'Sin Lista' });

  } catch (error) {
    console.error('Error al crear tarea desde entregable:', error);
    res.status(500).json({ message: 'Error al crear tarea' });
  }
};
