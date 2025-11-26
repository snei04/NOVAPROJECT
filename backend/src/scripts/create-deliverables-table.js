import pool from '../config/database.js';

const createDeliverablesTable = async () => {
  const connection = await pool.getConnection();
  try {
    console.log('Creando tabla deliverables...');
    
    await connection.query('DROP TABLE IF EXISTS deliverables');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS deliverables (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date DATETIME,
        status ENUM('pending', 'in_progress', 'in_review', 'approved', 'rejected') DEFAULT 'pending',
        type ENUM('document', 'code', 'design', 'report', 'other') DEFAULT 'document',
        progress INT DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
        evidence_link VARCHAR(512),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES boards(id) ON DELETE CASCADE
      )
    `);

    console.log('Tabla deliverables creada exitosamente.');
  } catch (error) {
    console.error('Error creando tabla deliverables:', error);
  } finally {
    connection.release();
    process.exit();
  }
};

createDeliverablesTable();
