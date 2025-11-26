import pool from '../config/database.js';

const checkRisks = async () => {
  try {
    const [rows] = await pool.query("DESCRIBE risks");
    console.log('Estructura de risks:', rows);
  } catch (error) {
    console.error('Error describiendo risks:', error.message);
  } finally {
    process.exit();
  }
};

checkRisks();
