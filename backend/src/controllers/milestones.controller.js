import pool from '../config/database.js';
import crypto from 'crypto';

/**
 * Obtener todos los milestones de un proyecto
 */
export const getMilestonesByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const [milestones] = await pool.query(
      `SELECT 
        id, 
        project_id as projectId,
        title,
        description,
        target_date as targetDate,
        status,
        progress_percentage as progressPercentage,
        priority,
        created_at as createdAt,
        updated_at as updatedAt
      FROM project_milestones 
      WHERE project_id = ?
      ORDER BY target_date ASC`,
      [projectId]
    );

    res.json({
      success: true,
      data: milestones,
      error: null
    });
  } catch (error) {
    console.error('Error obteniendo milestones:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: 'GET_MILESTONES_ERROR',
        message: 'Error al obtener milestones'
      }
    });
  }
};

/**
 * Crear un nuevo milestone
 */
export const createMilestone = async (req, res) => {
  try {
    const { projectId, title, description, targetDate, priority = 'medium' } = req.body;

    if (!projectId || !title || !targetDate) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'projectId, title y targetDate son requeridos'
        }
      });
    }

    const id = crypto.randomUUID();

    await pool.query(
      `INSERT INTO project_milestones (id, project_id, title, description, target_date, priority)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, projectId, title, description, targetDate, priority]
    );

    const [newMilestone] = await pool.query(
      `SELECT 
        id, 
        project_id as projectId,
        title,
        description,
        target_date as targetDate,
        status,
        progress_percentage as progressPercentage,
        priority,
        created_at as createdAt
      FROM project_milestones 
      WHERE id = ?`,
      [id]
    );

    res.status(201).json({
      success: true,
      data: newMilestone[0],
      error: null
    });
  } catch (error) {
    console.error('Error creando milestone:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: 'CREATE_MILESTONE_ERROR',
        message: 'Error al crear milestone'
      }
    });
  }
};

/**
 * Actualizar un milestone
 */
export const updateMilestone = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, targetDate, status, progressPercentage, priority } = req.body;

    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (targetDate !== undefined) {
      updates.push('target_date = ?');
      values.push(targetDate);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (progressPercentage !== undefined) {
      updates.push('progress_percentage = ?');
      values.push(progressPercentage);
    }
    if (priority !== undefined) {
      updates.push('priority = ?');
      values.push(priority);
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
      `UPDATE project_milestones SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const [updatedMilestone] = await pool.query(
      `SELECT 
        id, 
        project_id as projectId,
        title,
        description,
        target_date as targetDate,
        status,
        progress_percentage as progressPercentage,
        priority,
        updated_at as updatedAt
      FROM project_milestones 
      WHERE id = ?`,
      [id]
    );

    if (updatedMilestone.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: {
          code: 'MILESTONE_NOT_FOUND',
          message: 'Milestone no encontrado'
        }
      });
    }

    res.json({
      success: true,
      data: updatedMilestone[0],
      error: null
    });
  } catch (error) {
    console.error('Error actualizando milestone:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: 'UPDATE_MILESTONE_ERROR',
        message: 'Error al actualizar milestone'
      }
    });
  }
};

/**
 * Eliminar un milestone
 */
export const deleteMilestone = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM project_milestones WHERE id = ?', [id]);

    res.json({
      success: true,
      data: { id },
      error: null
    });
  } catch (error) {
    console.error('Error eliminando milestone:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: 'DELETE_MILESTONE_ERROR',
        message: 'Error al eliminar milestone'
      }
    });
  }
};

/**
 * Obtener métricas de un proyecto
 */
export const getProjectMetrics = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Calcular métricas en tiempo real
    const [milestones] = await pool.query(
      'SELECT status, progress_percentage FROM project_milestones WHERE project_id = ?',
      [projectId]
    );

    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    const avgProgress = milestones.length > 0 
      ? milestones.reduce((sum, m) => sum + m.progress_percentage, 0) / milestones.length 
      : 0;

    const metrics = {
      progress: {
        current: Math.round(avgProgress),
        target: 100,
        unit: '%',
        trend: 'up',
        status: avgProgress >= 75 ? 'good' : avgProgress >= 50 ? 'warning' : 'critical'
      },
      milestones: {
        completed: completedMilestones,
        total: totalMilestones,
        percentage: totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0
      }
    };

    res.json({
      success: true,
      data: metrics,
      error: null
    });
  } catch (error) {
    console.error('Error obteniendo métricas:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: 'GET_METRICS_ERROR',
        message: 'Error al obtener métricas'
      }
    });
  }
};
