import pool from '../config/database.js';

async function checkTables() {
  try {
    console.log('🔍 Checking tables...');
    
    try {
      const [milestones] = await pool.query("DESCRIBE project_milestones");
      console.log('✅ project_milestones exists:', milestones.map(c => `${c.Field} (${c.Type})`).join(', '));
    } catch (e) {
      console.log('❌ project_milestones table error:', e.message);
    }

    try {
      const [budget] = await pool.query("DESCRIBE budget_items");
      console.log('✅ budget_items exists:', budget.map(c => `${c.Field} (${c.Type})`).join(', '));
    } catch (e) {
      console.log('❌ budget_items table error:', e.message);
    }

    process.exit(0);
  } catch (error) {
    console.error('Global error:', error);
    process.exit(1);
  }
}

checkTables();
