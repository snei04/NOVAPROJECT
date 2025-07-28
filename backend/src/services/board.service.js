import pool from '../config/database.js';

class BoardService {

  /**
   * Crea un nuevo tablero y asigna al creador como el primer miembro con rol de 'owner'.
   * Usa una transacción para asegurar la integridad de los datos.
   */
  async createBoard({ title, backgroundColor, userId }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [boardResult] = await connection.query(
        'INSERT INTO boards (title, backgroundColor, user_id) VALUES (?, ?, ?)',
        [title, backgroundColor, userId]
      );
      const boardId = boardResult.insertId;
      await connection.query(
        'INSERT INTO board_members (board_id, user_id, role) VALUES (?, ?, ?)',
        [boardId, userId, 'owner']
      );
      await connection.commit();
      return { id: boardId, title, backgroundColor, user_id: userId };
    } catch (error) {
      await connection.rollback();
      throw error; // Lanza el error para que el controlador lo maneje
    } finally {
      connection.release();
    }
  }

  /**
   * Obtiene todos los tableros de un usuario, separados en 'owned' (creados por él)
   * y 'member' (a los que ha sido invitado).
   */
  async getUserBoards(userId) {
    const [ownedBoards] = await pool.query(
      'SELECT * FROM boards WHERE user_id = ?',
      [userId]
    );
    const [memberBoards] = await pool.query(`
      SELECT b.* FROM boards b
      INNER JOIN board_members bm ON b.id = bm.board_id
      WHERE bm.user_id = ? AND b.user_id != ?
    `, [userId, userId]);
    
    return { owned: ownedBoards, member: memberBoards };
  }

  /**
   * Obtiene todos los detalles de un tablero específico, incluyendo listas,
   * tarjetas, miembros, etiquetas y asignados.
   */
  async getFullBoardDetails(boardId) {
    const [boardRows] = await pool.query('SELECT * FROM boards WHERE id = ?', [boardId]);
    if (boardRows.length === 0) return null;
    const board = boardRows[0];

    const [lists] = await pool.query('SELECT * FROM lists WHERE board_id = ? ORDER BY position', [boardId]);
    const [cards] = await pool.query('SELECT id, title, description, position, due_date, list_id FROM cards WHERE list_id IN (SELECT id FROM lists WHERE board_id = ?) ORDER BY position', [boardId]);
    const [members] = await pool.query('SELECT u.id, u.nombre AS name, u.email, u.avatar FROM usuarios u INNER JOIN board_members bm ON u.id = bm.user_id WHERE bm.board_id = ?', [boardId]);
    const [labels] = await pool.query('SELECT l.id, l.name, l.color, cl.card_id FROM labels l INNER JOIN card_labels cl ON l.id = cl.label_id WHERE cl.card_id IN (SELECT id FROM cards WHERE list_id IN (SELECT id FROM lists WHERE board_id = ?))', [boardId]);
    const [assignees] = await pool.query('SELECT u.id, u.nombre as name, u.email, u.avatar, ca.card_id FROM usuarios u INNER JOIN card_assignees ca ON u.id = ca.user_id WHERE ca.card_id IN (SELECT id FROM cards WHERE list_id IN (SELECT id FROM lists WHERE board_id = ?))', [boardId]);

    const cardsWithDetails = cards.map(card => ({
      id: card.id,
      title: card.title,
      description: card.description,
      position: card.position,
      dueDate: card.due_date,
      list_id: card.list_id,
      labels: labels.filter(label => label.card_id === card.id),
      assignees: assignees.filter(assignee => assignee.card_id === card.id)
    }));
    
    board.lists = lists.map(list => ({
      ...list,
      cards: cardsWithDetails.filter(card => card.list_id === list.id)
    }));
    board.members = members;

    return board;
  }

  async updateBoard(boardId, updates) {
    const { title, backgroundColor } = updates;
    const fields = [];
    const values = [];

    if (title) {
      fields.push('title = ?');
      values.push(title);
    }
    if (backgroundColor) {
      fields.push('backgroundColor = ?');
      values.push(backgroundColor);
    }

    if (fields.length === 0) return; // No hay nada que actualizar

    values.push(boardId);
    const query = `UPDATE boards SET ${fields.join(', ')} WHERE id = ?`;
    await pool.query(query, values);
  }
  /**
   * Añade un nuevo miembro a un tablero.
   */
  async addMemberToBoard({ boardId, email }) {
    const [userToInviteRows] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (userToInviteRows.length === 0) {
      const error = new Error(`No se encontró un usuario con el email: ${email}`);
      error.statusCode = 404;
      throw error;
    }
    const userToInviteId = userToInviteRows[0].id;
    
    await pool.query('INSERT INTO board_members (board_id, user_id) VALUES (?, ?)', [boardId, userToInviteId]);
  }
}

export default new BoardService();