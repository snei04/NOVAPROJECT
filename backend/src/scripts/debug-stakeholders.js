import pool from '../config/database.js';

async function checkStakeholderData() {
  try {
    console.log('🔍 Verificando datos de Stakeholders...\n');
    
    // 1. Proyectos (usamos board_id como project_id en este contexto o project_milestones)
    // Asumimos project_id = 1
    const projectId = 1;

    // 2. Stakeholders
    const [stakeholders] = await pool.query('SELECT * FROM stakeholders WHERE project_id = ?', [projectId]);
    console.log(`👥 Stakeholders para Proyecto ${projectId}: ${stakeholders.length}`);
    
    let stakeholderId;

    if (stakeholders.length > 0) {
      console.log('   Ejemplo:', stakeholders[0]);
      stakeholderId = stakeholders[0].id;
    } else {
      console.log('   ⚠️ No hay stakeholders. Creando uno de prueba...');
      const [result] = await pool.query(`
        INSERT INTO stakeholders (project_id, name, role, email, influence_level, interest_level)
        VALUES (?, 'Stakeholder Prueba', 'Client', 'client@test.com', 'high', 'high')
      `, [projectId]);
      stakeholderId = result.insertId;
      console.log('   ✅ Stakeholder de prueba creado ID:', stakeholderId);
    }

    // 3. Disponibilidad
    const [availability] = await pool.query('SELECT * FROM stakeholder_availability WHERE stakeholder_id = ?', [stakeholderId]);
    console.log(`\n📅 Disponibilidad para Stakeholder ${stakeholderId}: ${availability.length} registros`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkStakeholderData();
