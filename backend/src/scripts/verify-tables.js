import pool from '../config/database.js';

async function verifyTables() {
  try {
    console.log('🔍 Verificando tablas de NovaProject v2.0.0...\n');
    
    const [tables] = await pool.query("SHOW TABLES");
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    const novaProjectTables = tableNames.filter(t => 
      t.includes('project') || 
      t.includes('stakeholder') || 
      t.includes('risk') || 
      t.includes('deliver') ||
      t.includes('meeting') ||
      t.includes('alert') ||
      t.includes('weekly')
    );
    
    console.log('✅ Tablas de NovaProject encontradas:\n');
    novaProjectTables.forEach(t => console.log(`  📋 ${t}`));
    
    console.log(`\n📊 Total: ${novaProjectTables.length} tablas\n`);
    
    // Contar registros en cada tabla
    console.log('📈 Registros en cada tabla:\n');
    for (const table of novaProjectTables) {
      try {
        const [result] = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`  ${table}: ${result[0].count} registros`);
      } catch (error) {
        console.log(`  ${table}: Error - ${error.message}`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyTables();
