import pool from '../config/database.js';

class DeliverableService {
  
  /**
   * Link a board to a deliverable
   */
  async linkBoard(deliverableId, boardId) {
    try {
      await pool.query(
        'INSERT INTO deliverable_boards (deliverable_id, board_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP',
        [deliverableId, boardId]
      );
      return { message: 'Board linked to deliverable successfully' };
    } catch (error) {
      console.error('Error linking board to deliverable:', error);
      throw error;
    }
  }

  /**
   * Check if a board is completed (all cards are completed)
   */
  async isBoardCompleted(boardId) {
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) as total_cards,
        SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed_cards
      FROM cards c
      JOIN lists l ON c.list_id = l.id
      WHERE l.board_id = ?
    `, [boardId]);

    const { total_cards, completed_cards } = rows[0];
    
    // If there are no cards, is it completed? Maybe yes, maybe no. 
    // Let's assume an empty board is "completed" or at least doesn't block. 
    // But usually a board needs work. Let's say if total > 0 and total == completed.
    if (total_cards === 0) return true; // Or false? I'll assume true for now (nothing pending).
    
    return Number(completed_cards) === Number(total_cards);
  }

  /**
   * Check and update deliverables associated with a board
   * This should be called whenever a card is updated/moved/completed in a board.
   */
  async checkAndCompleteDeliverables(boardId) {
    try {
        console.log(`[DeliverableService] Checking deliverables for board ${boardId}`);

        // 1. Check if this board is effectively completed
        const boardCompleted = await this.isBoardCompleted(boardId);
        if (!boardCompleted) {
            console.log(`[DeliverableService] Board ${boardId} is not complete. Deliverables won't be updated.`);
            return;
        }

        // 2. Find all deliverables linked to this board
        // We look in the new table AND the legacy project_id field
        const [deliverables] = await pool.query(`
            SELECT id, title FROM deliverables 
            WHERE project_id = ? 
            UNION 
            SELECT d.id, d.title FROM deliverables d
            JOIN deliverable_boards db ON d.id = db.deliverable_id
            WHERE db.board_id = ?
        `, [boardId, boardId]);

        console.log(`[DeliverableService] Found ${deliverables.length} linked deliverables.`);

        for (const deliverable of deliverables) {
            // 3. For each deliverable, check if ALL its linked boards are completed
            const allBoardsCompleted = await this.areAllBoardsCompletedForDeliverable(deliverable.id);
            
            if (allBoardsCompleted) {
                console.log(`[DeliverableService] All boards for deliverable ${deliverable.id} (${deliverable.title}) are complete. Marking as delivered.`);
                await this.markAsDelivered(deliverable.id);
            }
        }

    } catch (error) {
        console.error('[DeliverableService] Error checking deliverables:', error);
    }
  }

  async areAllBoardsCompletedForDeliverable(deliverableId) {
      // Get all boards linked to this deliverable (both via project_id and deliverable_boards)
      const [boards] = await pool.query(`
          SELECT id FROM boards WHERE id = (SELECT project_id FROM deliverables WHERE id = ?)
          UNION
          SELECT board_id as id FROM deliverable_boards WHERE deliverable_id = ?
      `, [deliverableId, deliverableId]);

      for (const board of boards) {
          const isComplete = await this.isBoardCompleted(board.id);
          if (!isComplete) return false;
      }
      return true;
  }

  async markAsDelivered(deliverableId) {
      await pool.query(
          'UPDATE deliverables SET status = ?, progress = 100, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
          ['delivered', deliverableId]
      );
  }
}

export default new DeliverableService();
