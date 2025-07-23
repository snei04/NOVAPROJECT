import pool from '../config/database.js';

class LabelService {

  /**
   * Crea una nueva etiqueta para un tablero específico.
   */
  async createLabel({ name, color, boardId }) {
    const [result] = await pool.query(
      'INSERT INTO labels (name, color, board_id) VALUES (?, ?, ?)',
      [name, color, boardId]
    );
    return { id: result.insertId, name, color, board_id: boardId };
  }

  /**
   * Asigna una etiqueta existente a una tarjeta.
   */
  async assignLabelToCard({ cardId, labelId }) {
    await pool.query(
      'INSERT INTO card_labels (card_id, label_id) VALUES (?, ?)',
      [cardId, labelId]
    );
  }

  /**
   * Quita la asignación de una etiqueta a una tarjeta.
   */
  async removeLabelFromCard({ cardId, labelId }) {
    await pool.query(
      'DELETE FROM card_labels WHERE card_id = ? AND label_id = ?',
      [cardId, labelId]
    );
  }

  /**
   * Actualiza el nombre y/o el color de una etiqueta existente.
   */
  async updateLabel(labelId, { name, color }) {
    const fields = [];
    const values = [];
    if (name) {
      fields.push('name = ?');
      values.push(name);
    }
    if (color) {
      fields.push('color = ?');
      values.push(color);
    }
    values.push(labelId);

    const query = `UPDATE labels SET ${fields.join(', ')} WHERE id = ?`;
    await pool.query(query, values);
  }

  /**
   * Obtiene todas las etiquetas que pertenecen a un tablero.
   */
  async getLabelsByBoard(boardId) {
    const [labels] = await pool.query('SELECT * FROM labels WHERE board_id = ?', [boardId]);
    return labels;
  }
}

export default new LabelService();