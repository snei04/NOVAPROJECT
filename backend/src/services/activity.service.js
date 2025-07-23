// src/services/activity.service.js
import pool from '../config/database.js';

class ActivityService {
  async logActivity({ description, boardId, userId }) {
    try {
      await pool.query(
        'INSERT INTO activities (description, board_id, user_id) VALUES (?, ?, ?)',
        [description, boardId, userId]
      );
    } catch (error) {
      // Es importante que el log de actividad no detenga la acción principal.
      // Por eso, solo lo mostraremos en la consola del servidor.
      console.error('Error al registrar la actividad:', error);
    }
  }
}

export default new ActivityService();