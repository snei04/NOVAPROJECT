import pool from '../config/database.js';

class BoardService {

  /**
   * Crea un nuevo tablero y asigna al creador como el primer miembro con rol de 'owner'.
   * Usa una transacción para asegurar la integridad de los datos.
   */
  async createBoard({ title, backgroundColor, userId, generalObjective, scopeDefinition, specificObjectives }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const objectivesJson = specificObjectives ? JSON.stringify(specificObjectives) : null;

      const [boardResult] = await connection.query(
        'INSERT INTO boards (title, backgroundColor, user_id, general_objective, scope_definition, specific_objectives) VALUES (?, ?, ?, ?, ?, ?)',
        [title, backgroundColor, userId, generalObjective, scopeDefinition, objectivesJson]
      );
      const boardId = boardResult.insertId;
      await connection.query(
        'INSERT INTO board_members (board_id, user_id, role) VALUES (?, ?, ?)',
        [boardId, userId, 'owner']
      );

      // Crear listas por defecto
      const defaultLists = ['Pendiente', 'En Progreso', 'Completado'];
      for (let i = 0; i < defaultLists.length; i++) {
        await connection.query(
          'INSERT INTO lists (board_id, title, position) VALUES (?, ?, ?)',
          [boardId, defaultLists[i], (i + 1) * 1000]
        );
      }

      await connection.commit();
      return { 
        id: boardId, 
        title, 
        backgroundColor, 
        user_id: userId,
        general_objective: generalObjective,
        scope_definition: scopeDefinition,
        specific_objectives: specificObjectives
      };
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
   * tarjetas, miembros, etiquetas, asignados y métricas financieras.
   */
  async getFullBoardDetails(boardId) {
    const [boardRows] = await pool.query('SELECT * FROM boards WHERE id = ?', [boardId]);
    if (boardRows.length === 0) return null;
    const board = boardRows[0];

    // Map snake_case to camelCase for frontend compatibility
    board.generalObjective = board.general_objective;
    board.scopeDefinition = board.scope_definition;
    try {
      board.specificObjectives = typeof board.specific_objectives === 'string' 
        ? JSON.parse(board.specific_objectives) 
        : board.specific_objectives;
    } catch (e) {
      board.specificObjectives = [];
    }
    board.projectBenefit = board.project_benefit;

    // Calculate financial metrics from Budget Module (Source of Truth)
    const [budgetStats] = await pool.query(`
      SELECT 
        SUM(amount_approved) as total_approved, 
        SUM(amount_executed) as total_executed 
      FROM budget_items 
      WHERE project_id = ?
    `, [boardId]);

    const realEstimated = Number(budgetStats[0]?.total_approved || 0);
    const realActual = Number(budgetStats[0]?.total_executed || 0);

    // Update the board object with real values so frontend displays them
    board.budgetEstimated = realEstimated;
    board.budgetActual = realActual;

    board.financials = {
      budgetEstimated: realEstimated,
      budgetActual: realActual,
      projectBenefit: Number(board.project_benefit || 0),
      deviation: realActual - realEstimated,
      roi: realActual > 0 
        ? ((Number(board.project_benefit || 0) - realActual) / realActual) * 100 
        : 0
    };

    const [lists] = await pool.query('SELECT * FROM lists WHERE board_id = ? ORDER BY position', [boardId]);
    const [cards] = await pool.query('SELECT id, title, description, position, due_date, list_id, is_completed FROM cards WHERE list_id IN (SELECT id FROM lists WHERE board_id = ?) ORDER BY position', [boardId]);
    const [members] = await pool.query('SELECT u.id, u.nombre AS name, u.email, u.avatar FROM usuarios u INNER JOIN board_members bm ON u.id = bm.user_id WHERE bm.board_id = ?', [boardId]);
    const [labels] = await pool.query('SELECT l.id, l.name, l.color, cl.card_id FROM labels l INNER JOIN card_labels cl ON l.id = cl.label_id WHERE cl.card_id IN (SELECT id FROM cards WHERE list_id IN (SELECT id FROM lists WHERE board_id = ?))', [boardId]);
    const [assignees] = await pool.query('SELECT u.id, u.nombre as name, u.email, u.avatar, ca.card_id FROM usuarios u INNER JOIN card_assignees ca ON u.id = ca.user_id WHERE ca.card_id IN (SELECT id FROM cards WHERE list_id IN (SELECT id FROM lists WHERE board_id = ?))', [boardId]);

    const cardsWithDetails = cards.map(card => ({
      id: card.id,
      title: card.title,
      description: card.description,
      position: card.position,
      dueDate: card.due_date,
      isCompleted: Boolean(card.is_completed),
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
    const { title, backgroundColor, budgetEstimated, budgetActual, projectBenefit, generalObjective, scopeDefinition, specificObjectives } = updates;
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
    if (budgetEstimated !== undefined) {
      fields.push('budget_estimated = ?');
      values.push(budgetEstimated);
    }
    if (budgetActual !== undefined) {
      fields.push('budget_actual = ?');
      values.push(budgetActual);
    }
    if (projectBenefit !== undefined) {
      fields.push('project_benefit = ?');
      values.push(projectBenefit);
    }
    if (generalObjective !== undefined) {
      fields.push('general_objective = ?');
      values.push(generalObjective);
    }
    if (scopeDefinition !== undefined) {
      fields.push('scope_definition = ?');
      values.push(scopeDefinition);
    }
    if (specificObjectives !== undefined) {
      fields.push('specific_objectives = ?');
      values.push(specificObjectives ? JSON.stringify(specificObjectives) : null);
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

  async getAssociations(boardId) {
    // Esta consulta obtiene los detalles de los tableros asociados
    const [associated] = await pool.query(`
      SELECT b.id, b.title, b.backgroundColor 
      FROM boards b
      JOIN associated_boards ab ON b.id = ab.board_id_2
      WHERE ab.board_id_1 = ?
    `, [boardId]);
    return associated;
  }

  async createAssociation({ boardId, associatedBoardId }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Contamos las asociaciones para ambos tableros
      const [countRows1] = await connection.query('SELECT COUNT(*) as count FROM associated_boards WHERE board_id_1 = ?', [boardId]);
      const [countRows2] = await connection.query('SELECT COUNT(*) as count FROM associated_boards WHERE board_id_1 = ?', [associatedBoardId]);

      // 2. Verificamos si alguno de los dos ha alcanzado el límite de 5
      if (countRows1[0].count >= 5 || countRows2[0].count >= 5) {
        const error = new Error('Uno de los tableros ha alcanzado el límite máximo de 5 asociaciones.');
        error.statusCode = 409;
        throw error;
      }

      // 3. Insertamos la asociación en ambas direcciones
      // A -> B
      await connection.query(
        'INSERT INTO associated_boards (board_id_1, board_id_2) VALUES (?, ?)',
        [boardId, associatedBoardId]
      );
      // B -> A
      await connection.query(
        'INSERT INTO associated_boards (board_id_1, board_id_2) VALUES (?, ?)',
        [associatedBoardId, boardId]
      );

      // 4. Si todo sale bien, confirmamos los cambios
      await connection.commit();

    } catch (error) {
      // Si algo falla, revertimos todos los cambios
      await connection.rollback();
      throw error; // Lanzamos el error para que el controlador lo maneje
    } finally {
      // Liberamos la conexión a la base de datos
      connection.release();
    }
  }

  async getDashboardData(boardId) {
  // 1. Reutiliza otro método para obtener todos los detalles del tablero desde la base de datos.
  const board = await this.getFullBoardDetails(boardId);

  // 2. Realiza los cálculos necesarios (contar tarjetas, calcular progreso, etc.).
  let totalCards = 0;
  let completedCards = 0;
  // ... lógica de cálculo ...
  const progress = (completedCards / totalCards) * 100;

  // 3. Devuelve un objeto JSON limpio con los resultados al controlador.
  return {
    totalCards,
    completedCards,
    progress: Math.round(progress),
  };
}

}



export default new BoardService();