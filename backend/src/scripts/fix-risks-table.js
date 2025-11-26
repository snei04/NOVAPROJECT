import pool from '../config/database.js';

const fixRisksTable = async () => {
  const connection = await pool.getConnection();
  try {
    console.log('Re-creando tabla risks (versión compatible)...');
    
    await connection.query('DROP TABLE IF EXISTS risks');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS risks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        probability INT NOT NULL,
        impact INT NOT NULL,
        severity INT DEFAULT 0,
        status ENUM('identified', 'assessed', 'mitigated', 'closed', 'occurred') DEFAULT 'identified',
        mitigation_plan TEXT,
        owner_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES boards(id) ON DELETE CASCADE,
        FOREIGN KEY (owner_id) REFERENCES usuarios(id) ON DELETE SET NULL
      )
    `);

    console.log('Tabla risks re-creada exitosamente.');
  } catch (error) {
    console.error('Error re-creando tabla risks:', error);
  } finally {
    connection.release();
    process.exit();
  }
};

fixRisksTable();
