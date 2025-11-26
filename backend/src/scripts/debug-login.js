import pool from '../config/database.js';

async function checkTables() {
  try {
    console.log('🔍 Verificando tablas en mi_nova_db...\n');
    
    // 1. Listar todas las tablas
    const [tables] = await pool.query("SHOW TABLES");
    const tableNames = tables.map(t => Object.values(t)[0]);
    console.log('📋 Tablas encontradas:', tableNames.join(', '));

    // 2. Verificar si existe 'usuarios' o 'users'
    const hasUsuarios = tableNames.includes('usuarios');
    const hasUsers = tableNames.includes('users');
    
    if (hasUsuarios) {
      console.log('\n✅ Tabla "usuarios" encontrada. Verificando estructura...');
      const [columns] = await pool.query("DESCRIBE usuarios");
      console.log(columns.map(c => `${c.Field} (${c.Type})`).join(', '));
      
      const [rows] = await pool.query("SELECT * FROM usuarios");
      console.log(`\n👥 Total usuarios: ${rows.length}`);
      if (rows.length > 0) console.log('Ejemplo:', rows[0]);
    }

    if (hasUsers) {
      console.log('\n✅ Tabla "users" encontrada. Verificando estructura...');
      const [columns] = await pool.query("DESCRIBE users");
      console.log(columns.map(c => `${c.Field} (${c.Type})`).join(', '));
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTables();
