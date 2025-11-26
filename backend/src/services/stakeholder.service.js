import pool from '../config/database.js';

class StakeholderService {
  /**
   * Obtiene todos los stakeholders de un tablero.
   */
  async getAllByBoard(boardId) {
    const [stakeholders] = await pool.query(
      'SELECT * FROM stakeholders WHERE project_id = ?',
      [boardId]
    );
    return stakeholders;
  }

async createInterview(interviewData) {
    const { title, startTime, endTime, boardId, createdByUserId, stakeholderIds } = interviewData;
    
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Inserta la entrevista en la tabla principal
      const [interviewResult] = await connection.query(
        'INSERT INTO interviews (title, start_time, end_time, board_id, created_by_user_id) VALUES (?, ?, ?, ?, ?)',
        [title, startTime, endTime, boardId, createdByUserId]
      );
      const interviewId = interviewResult.insertId;

      // 2. Inserta cada participante en la tabla de unión
      if (stakeholderIds && stakeholderIds.length > 0) {
        const stakeholderValues = stakeholderIds.map(stakeholderId => [interviewId, stakeholderId]);
        await connection.query(
          'INSERT INTO interview_stakeholders (interview_id, stakeholder_id) VALUES ?',
          [stakeholderValues]
        );
      }

      await connection.commit();
      return { id: interviewId, ...interviewData };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new StakeholderService();