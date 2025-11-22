import pool from '../config/database.js';

const debugRisks = async () => {
  const connection = await pool.getConnection();
  try {
    // 1. Check Table Structure
    console.log('🔍 Estructura de tabla `risks`:');
    const [columns] = await connection.query('DESCRIBE risks');
    console.table(columns);

    // 2. Check Risk Data
    console.log('\n🔍 Datos en tabla `risks`:');
    const [rows] = await connection.query('SELECT id, project_id, status, severity FROM risks');
    console.table(rows);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    connection.release();
    process.exit();
  }
};

debugRisks();
