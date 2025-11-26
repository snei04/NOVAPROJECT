import pool from '../config/database.js';

const createRisksTable = async () => {
  const connection = await pool.getConnection();
  try {
    console.log('Creando tabla risks...');
    
    // Tabla principal de Riesgos
    await connection.query(`
      CREATE TABLE IF NOT EXISTS risks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        probability INT NOT NULL CHECK (probability BETWEEN 1 AND 5),
        impact INT NOT NULL CHECK (impact BETWEEN 1 AND 5),
        severity INT GENERATED ALWAYS AS (probability * impact) STORED,
        status ENUM('identified', 'assessed', 'mitigated', 'closed', 'occurred') DEFAULT 'identified',
        mitigation_plan TEXT,
        owner_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES boards(id) ON DELETE CASCADE,
        FOREIGN KEY (owner_id) REFERENCES usuarios(id) ON DELETE SET NULL
      )
    `);

    console.log('Tabla risks creada exitosamente.');
  } catch (error) {
    console.error('Error creando tabla risks:', error);
  } finally {
    connection.release();
    process.exit();
  }
};

createRisksTable();
