import pool from '../config/database.js';

class BudgetService {
  
  async getBudgetItems(projectId) {
    const [items] = await pool.query(`
      SELECT b.*, m.title as milestone_title 
      FROM budget_items b
      LEFT JOIN project_milestones m ON b.milestone_id = m.id
      WHERE b.project_id = ?
      ORDER BY b.created_at DESC
    `, [projectId]);
    return items;
  }

  async createBudgetItem(data) {
    const { projectId, milestoneId, milestone_id, description, category, amountApproved, amount_approved, amountExecuted, amount_executed, justification } = data;
    
    // Handle both camelCase and snake_case inputs
    const finalMilestoneId = milestoneId || milestone_id || null;
    const finalAmountApproved = amountApproved || amount_approved || 0;
    const finalAmountExecuted = amountExecuted || amount_executed || 0;

    const [result] = await pool.query(`
      INSERT INTO budget_items (project_id, milestone_id, description, category, amount_approved, amount_executed, justification)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [projectId, finalMilestoneId, description, category, finalAmountApproved, finalAmountExecuted, justification]);

    return { id: result.insertId, ...data };
  }

  async updateBudgetItem(id, data) {
    const { description, category, amountApproved, amount_approved, amountExecuted, amount_executed, justification, milestoneId, milestone_id } = data;
    
    const finalMilestoneId = milestoneId || milestone_id || null;
    const finalAmountApproved = amountApproved !== undefined ? amountApproved : (amount_approved !== undefined ? amount_approved : 0);
    const finalAmountExecuted = amountExecuted !== undefined ? amountExecuted : (amount_executed !== undefined ? amount_executed : 0);
    
    // Note: We should probably update milestone_id too if it's editable
    await pool.query(`
      UPDATE budget_items 
      SET description = ?, category = ?, amount_approved = ?, amount_executed = ?, justification = ?, milestone_id = ?
      WHERE id = ?
    `, [description, category, finalAmountApproved, finalAmountExecuted, justification, finalMilestoneId, id]);

    return { id, ...data };
  }

  async deleteBudgetItem(id) {
    await pool.query('DELETE FROM budget_items WHERE id = ?', [id]);
    return { message: 'Item deleted' };
  }

  async getBudgetSummary(projectId) {
    const [rows] = await pool.query(`
      SELECT 
        SUM(amount_approved) as total_approved,
        SUM(amount_executed) as total_executed
      FROM budget_items
      WHERE project_id = ?
    `, [projectId]);

    const totalApproved = Number(rows[0].total_approved || 0);
    const totalExecuted = Number(rows[0].total_executed || 0);

    return {
      totalApproved,
      totalExecuted,
      remaining: totalApproved - totalExecuted,
      executionPercentage: totalApproved > 0 ? (totalExecuted / totalApproved) * 100 : 0
    };
  }
}

export default new BudgetService();
