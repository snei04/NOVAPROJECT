import pool from '../config/database.js';

const createActionItemsTable = async () => {
  const connection = await pool.getConnection();
  try {
    console.log('Re-creando tabla action_items...');
    
    await connection.query('DROP TABLE IF EXISTS action_items');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS action_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        meeting_id VARCHAR(36) NOT NULL,
        description TEXT NOT NULL,
        status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
        due_date DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
      )
    `);

    console.log('Tabla action_items creada exitosamente con meeting_id VARCHAR(36).');
  } catch (error) {
    console.error('Error creando tabla action_items:', error);
  } finally {
    connection.release();
    process.exit();
  }
};

createActionItemsTable();
