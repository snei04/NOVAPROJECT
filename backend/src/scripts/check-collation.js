import pool from '../config/database.js';

async function checkCollation() {
  try {
    const [rows] = await pool.query("SHOW FULL COLUMNS FROM project_milestones WHERE Field = 'id'");
    console.log('project_milestones.id collation:', rows[0].Collation);
    
    const [rows2] = await pool.query("SHOW FULL COLUMNS FROM budget_items WHERE Field = 'milestone_id'");
    console.log('budget_items.milestone_id collation:', rows2[0].Collation);
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkCollation();
