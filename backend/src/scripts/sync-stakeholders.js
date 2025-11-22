import pool from '../config/database.js';

async function syncStakeholders() {
  try {
    console.log('🔄 Iniciando sincronización de Miembros a Stakeholders...\n');

    // 1. Obtener todos los miembros de tableros
    // Unimos con usuarios para obtener el nombre y email
    const [members] = await pool.query(`
      SELECT 
        bm.board_id, 
        bm.user_id, 
        bm.role as board_role,
        u.nombre, 
        u.email 
      FROM board_members bm
      JOIN usuarios u ON bm.user_id = u.id
    `);

    console.log(`📋 Encontrados ${members.length} miembros en tableros.`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const member of members) {
      // 2. Verificar si ya existe como stakeholder
      // Usamos project_id = board_id y buscamos por email en contact_info
      const [existing] = await pool.query(
        `SELECT id FROM stakeholders WHERE project_id = ? AND JSON_EXTRACT(contact_info, '$.email') = ?`,
        [member.board_id, member.email]
      );

      if (existing.length === 0) {
        // 3. Crear stakeholder
        await pool.query(
          `INSERT INTO stakeholders (project_id, name, role, priority, contact_info)
           VALUES (?, ?, ?, ?, ?)`,
          [
            member.board_id, 
            member.nombre, 
            member.board_role === 'owner' ? 'Project Owner' : 'Team Member', 
            'medium', 
            JSON.stringify({ email: member.email, isSystemUser: true, userId: member.user_id })
          ]
        );
        console.log(`   ✅ Creado: ${member.nombre} en Proyecto ${member.board_id}`);
        createdCount++;
      } else {
        skippedCount++;
      }
    }

    console.log(`\n🏁 Sincronización completada.`);
    console.log(`   ✨ Creados: ${createdCount}`);
    console.log(`   ⏭️  Omitidos (ya existían): ${skippedCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

syncStakeholders();
