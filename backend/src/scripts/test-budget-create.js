import pool from '../config/database.js';
import budgetService from '../services/budget.service.js';

async function testCreateBudget() {
  try {
    console.log('🧪 Testing Create BudgetItem...');
    
    const newItem = {
      projectId: 7,
      description: 'Test Item ' + Date.now(),
      category: 'Hardware',
      amountApproved: 1500.50,
      amountExecuted: 500.25,
      justification: 'Testing backend fix'
    };

    const created = await budgetService.createBudgetItem(newItem);
    console.log('✅ Item Created:', created);

    // Verify in DB
    const [rows] = await pool.query('SELECT * FROM budget_items WHERE id = ?', [created.id]);
    console.log('🔍 DB Record:', rows[0]);

    if (Number(rows[0].amount_approved) === 1500.50) {
        console.log('✅ Amount Approved matches!');
    } else {
        console.log('❌ Amount Approved mismatch:', rows[0].amount_approved);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testCreateBudget();
