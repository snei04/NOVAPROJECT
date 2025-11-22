import pool from '../config/database.js';

async function createRiskTable() {
  try {
    console.log('🛠️ Creando tabla risks...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS risks (
        id VARCHAR(36) PRIMARY KEY,
        project_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category ENUM('technical', 'resource', 'schedule', 'budget', 'stakeholder', 'quality', 'external') NOT NULL,
        probability ENUM('very_low', 'low', 'medium', 'high', 'very_high') NOT NULL,
        impact ENUM('very_low', 'low', 'medium', 'high', 'very_high') NOT NULL,
        status ENUM('identified', 'analyzing', 'mitigating', 'monitoring', 'closed', 'occurred') DEFAULT 'identified',
        identified_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES boards(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    
    console.log('✅ Tabla risks creada exitosamente.');
    
    // Verificar si risk_controls tiene FK correcta
    // Si risk_controls se creó antes, quizás no tenga la FK a risks
    // Pero eso es más complejo de alterar ahora sin borrar datos.
    // Asumiremos que risk_controls usa risk_id correctamente.

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createRiskTable();
