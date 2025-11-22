import pool from '../config/database.js';

async function describeTables() {
  try {
    console.log('🔍 Listado de Tablas:');
    const [tables] = await pool.query("SHOW TABLES");
    console.log(tables);

    // ... describe stakeholders ...
    console.log('\n🔍 Estructura de stakeholders:');
    const [columns] = await pool.query("DESCRIBE stakeholders");
    console.log(columns.map(c => `${c.Field} (${c.Type})`).join(', '));

    console.log('\n🔍 Estructura de stakeholder_availability:');
    const [availCols] = await pool.query("DESCRIBE stakeholder_availability");
    console.log(availCols.map(c => `${c.Field} (${c.Type})`).join(', '));

    console.log('\n🔍 Estructura de project_milestones:');
    const [milCols] = await pool.query("DESCRIBE project_milestones");
    console.log(milCols.map(c => `${c.Field} (${c.Type})`).join(', '));

    console.log('\n🔍 Estructura de risk_controls:');
    const [riskCols] = await pool.query("DESCRIBE risk_controls");
    console.log(riskCols.map(c => `${c.Field} (${c.Type})`).join(', '));

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

describeTables();
