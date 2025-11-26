import pool from '../config/database.js';

async function checkBudgetTable() {
  try {
    console.log('🔍 Budget Items:');
    const [cols] = await pool.query("DESCRIBE budget_items");
    console.log(cols.map(c => `${c.Field} (${c.Type})`).join(', '));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkBudgetTable();
