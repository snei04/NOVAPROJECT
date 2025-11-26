import pool from '../config/database.js';

const checkTable = async () => {
  try {
    const [rows] = await pool.query("DESCRIBE action_items");
    console.log('Estructura de action_items:', rows);
  } catch (error) {
    console.error('Error describiendo tabla:', error.message);
  } finally {
    process.exit();
  }
};

checkTable();
