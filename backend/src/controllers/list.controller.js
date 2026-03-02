// src/controllers/list.controller.js
import ListService from '../services/list.service.js';
import pool from '../config/database.js';


export const createList = async (req, res) => {
  try {
    const { boardId } = req.body;
    const userId = req.user.id;

    // La verificación de permisos se queda en el controlador
    // PERMISO ACTUALIZADO: Permitir a miembros (no solo dueños) crear listas
    const [permissionRows] = await pool.query(`
      SELECT b.id 
      FROM boards b 
      LEFT JOIN board_members bm ON b.id = bm.board_id 
      WHERE b.id = ? AND (b.user_id = ? OR bm.user_id = ?)
      LIMIT 1
    `, [boardId, userId, userId]);

    if (permissionRows.length === 0) {
      return res.status(404).json({ message: 'Tablero no encontrado o no tienes permiso para crear listas.' });
    }

    // [SINCRONIZACIÓN INVERSA] - Cuando se crea una lista en el Kanban, generar el milestone
    const crypto = await import('crypto');
    const milestoneId = crypto.randomUUID();
    const targetDate = req.body.targetDate || new Date().toISOString().split('T')[0];

    await pool.query(
      `INSERT INTO project_milestones (id, project_id, title, target_date, priority)
       VALUES (?, ?, ?, ?, ?)`,
      [milestoneId, boardId, req.body.title, targetDate, 'medium']
    );

    // Inject milestoneId into the creation payload so it's linked
    req.body.milestoneId = milestoneId;

    const newList = await ListService.createList(req.body);
    res.status(201).json(newList);
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateList = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body; // Para renombrar la lista

    // Obtener la lista para saber su milestone_id
    const [listRows] = await pool.query('SELECT milestone_id FROM lists WHERE id = ?', [id]);

    await ListService.updateList(id, { title });

    // [SINCRONIZACIÓN INVERSA] - Renombrar hito
    if (listRows.length > 0 && listRows[0].milestone_id) {
      await pool.query('UPDATE project_milestones SET title = ? WHERE id = ?', [title, listRows[0].milestone_id]);
    }

    res.status(200).json({ message: 'Lista actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar la lista:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


export const deleteList = async (req, res) => {
  const { id } = req.params; // ID de la lista a eliminar
  const userId = req.user.id;

  try {
    // Verificación de seguridad: Asegurarse de que el usuario tiene permiso sobre la lista
    const [listRows] = await pool.query(`
      SELECT l.id FROM lists l
      INNER JOIN boards b ON l.board_id = b.id
      WHERE l.id = ? AND b.user_id = ?
    `, [id, userId]);

    if (listRows.length === 0) {
      return res.status(404).json({ message: 'Lista no encontrada o no pertenece al usuario' });
    }

    // Obtener la lista para saber su milestone_id antes de borrarla
    const [listToDel] = await pool.query('SELECT milestone_id FROM lists WHERE id = ?', [id]);

    // Si todo está bien, procedemos a eliminarla
    await pool.query('DELETE FROM lists WHERE id = ?', [id]);

    // [SINCRONIZACIÓN INVERSA] - Borrar hito
    if (listToDel.length > 0 && listToDel[0].milestone_id) {
      await pool.query('DELETE FROM project_milestones WHERE id = ?', [listToDel[0].milestone_id]);
    }

    // "ON DELETE CASCADE" se encargará de borrar las tarjetas asociadas.

    res.status(200).json({ message: 'Lista eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};