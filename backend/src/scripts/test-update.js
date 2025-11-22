import pool from '../config/database.js';

const testUpdate = async () => {
  try {
    const id = 2;
    const progress = 50;
    
    console.log(`Intentando actualizar ID ${id} con progress ${progress}...`);
    
    const [result] = await pool.query(`UPDATE deliverables SET progress = ? WHERE id = ?`, [progress, id]);
    console.log('Update result:', result);
    
  } catch (error) {
    console.error('ERROR en UPDATE:', error);
  } finally {
    process.exit();
  }
};

testUpdate();
