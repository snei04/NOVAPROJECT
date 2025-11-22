import pool from '../config/database.js';

async function checkStakeholders() {
  try {
    const [columns] = await pool.query("DESCRIBE stakeholders");
    console.log('📋 Estructura de la tabla stakeholders:\n');
    columns.forEach(col => {
      console.log(`  ${col.Field} - ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : ''}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkStakeholders();
