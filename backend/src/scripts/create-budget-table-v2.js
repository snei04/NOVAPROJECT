import pool from '../config/database.js';

async function createBudgetTable() {
  try {
    console.log('🚀 Creando tabla de presupuesto...');

    // 1. Crear tabla budget_items
    // project_id -> INT (boards.id)
    // milestone_id -> VARCHAR(36) (project_milestones.id)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS budget_items (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        project_id INT NOT NULL,
        milestone_id VARCHAR(36), 
        description VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        assigned_to INT, 
        amount_approved DECIMAL(15,2) DEFAULT 0.00,
        amount_executed DECIMAL(15,2) DEFAULT 0.00,
        justification TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (project_id) REFERENCES boards(id) ON DELETE CASCADE,
        FOREIGN KEY (milestone_id) REFERENCES project_milestones(id) ON DELETE SET NULL,
        INDEX idx_project_budget (project_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ Tabla budget_items creada exitosamente');

    // 2. Insertar datos de ejemplo
    const [boards] = await pool.query('SELECT id FROM boards LIMIT 1');
    if (boards.length > 0) {
      const projectId = boards[0].id;
      
      // Buscar si ya hay datos
      const [existing] = await pool.query('SELECT id FROM budget_items WHERE project_id = ?', [projectId]);
      
      if (existing.length === 0) {
        console.log('📝 Creando datos de ejemplo para presupuesto...');
        
        // Intentar obtener un milestone
        const [milestones] = await pool.query('SELECT id FROM project_milestones WHERE project_id = ? LIMIT 1', [projectId]);
        const milestoneId = milestones.length > 0 ? milestones[0].id : null;

        await pool.query(`
          INSERT INTO budget_items (project_id, milestone_id, description, category, amount_approved, amount_executed)
          VALUES 
            (?, ?, 'Fase 1 - Customer Journey Completo', 'Consultoría', 17400000, 17400000),
            (?, ?, 'Licencias de Software - Q1', 'Licencias', 5000000, 2500000),
            (?, ?, 'Infraestructura Cloud', 'Hardware', 10000000, 0)
        `, [projectId, milestoneId, projectId, milestoneId, projectId, milestoneId]);
        
        console.log('✅ Datos de ejemplo insertados');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando tabla:', error);
    process.exit(1);
  }
}

createBudgetTable();
