import pool from '../config/database.js';

async function checkSchemas() {
  try {
    console.log('🔍 Boards:');
    const [boardsCols] = await pool.query("DESCRIBE boards");
    console.log(boardsCols.map(c => `${c.Field} (${c.Type})`).join(', '));

    console.log('\n🔍 Project Milestones:');
    const [milestoneCols] = await pool.query("DESCRIBE project_milestones");
    console.log(milestoneCols.map(c => `${c.Field} (${c.Type})`).join(', '));
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkSchemas();
