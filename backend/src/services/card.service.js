// src/services/card.service.js
import pool from '../config/database.js';
import ActivityService from './activity.service.js';

class CardService {
  async createCard({ title, listId, position, description, dueDate }) {
    const mysqlDate = dueDate ? new Date(dueDate).toISOString().slice(0, 19).replace('T', ' ') : null;
    const [result] = await pool.query(
      'INSERT INTO cards (title, list_id, position, description, due_date) VALUES (?, ?, ?, ?, ?)',
      [title, listId, position, description || null, mysqlDate]
    );
    return { id: result.insertId, title, list_id: listId, position, description, due_date: mysqlDate };
  }

  async updateCard(cardId, updates) {
    const fieldsToUpdate = [];
    const values = [];

    for (const key in updates) {
      if (updates[key] !== undefined) {
        let field = key;
        let value = updates[key];
        if (key === 'dueDate') {
          field = 'due_date';
          value = value ? new Date(value).toISOString().slice(0, 19).replace('T', ' ') : null;
        }
        if (key === 'listId') field = 'list_id';

        fieldsToUpdate.push(`${field} = ?`);
        values.push(value);
      }
    }

    if (fieldsToUpdate.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    values.push(cardId);
    const query = `UPDATE cards SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
    await pool.query(query, values);

    // Log de actividad si se mueve la tarjeta
    if (updates.listId) {
        const [cardData] = await pool.query('SELECT title, l.board_id FROM cards c JOIN lists l ON c.list_id = l.id WHERE c.id = ?', [cardId]);
        const [listData] = await pool.query('SELECT title FROM lists WHERE id = ?', [updates.listId]);
        const logDescription = `movido la tarjeta "${cardData[0].title}" a la lista "${listData[0].title}"`;
        // Nota: necesitaríamos el nombre y el ID del usuario aquí para un log completo.
        // Esto muestra una limitación y un área de mejora futura.
    }
  }
}

export default new CardService();