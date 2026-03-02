// src/services/list.service.js
import pool from '../config/database.js';


class ListService {
  async createList({ title, position, boardId, milestoneId }) {
    const [result] = await pool.query(
      'INSERT INTO lists (title, position, board_id, milestone_id) VALUES (?, ?, ?, ?)',
      [title, position, boardId, milestoneId || null]
    );
    return { id: result.insertId, title, position, board_id: boardId, milestone_id: milestoneId };
  }

  async updateList(listId, updates) {
    const { title } = updates;
    if (title) { // Solo actualiza si se provee un título
      await pool.query('UPDATE lists SET title = ? WHERE id = ?', [title, listId]);
    }
  }

  async deleteList(listId) {
    await pool.query('DELETE FROM lists WHERE id = ?', [listId]);
  }
}

export default new ListService();