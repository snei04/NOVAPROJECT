// src/services/list.service.js
import pool from '../config/database.js';

class ListService {
  async createList({ title, position, boardId }) {
    const [result] = await pool.query(
      'INSERT INTO lists (title, position, board_id) VALUES (?, ?, ?)',
      [title, position, boardId]
    );
    return { id: result.insertId, title, position, board_id: boardId };
  }

  async deleteList(listId) {
    await pool.query('DELETE FROM lists WHERE id = ?', [listId]);
  }
}

export default new ListService();