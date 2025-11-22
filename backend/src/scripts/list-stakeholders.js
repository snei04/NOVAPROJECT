import pool from '../config/database.js';

async function listStakeholders() {
  try {
    const [rows] = await pool.query('SELECT id, project_id, name FROM stakeholders');
    console.log('📋 Stakeholders Reales en BD:');
    console.table(rows);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

listStakeholders();
