import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function updateDatabase() {
  try {
    console.log('🚀 Iniciando actualización de base de datos a v2.1.0...');
    console.log('📦 Conectando a la base de datos...\n');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '../config/update-schema-v2.1.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Dividir en statements
    // Primero quitamos comentarios línea por línea
    const cleanSql = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    const statements = cleanSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`📝 Ejecutando ${statements.length} sentencias de actualización...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        // Intentar ejecutar. Si falla por columna existente, ignoramos o logueamos warning.
        // MySQL "ADD COLUMN IF NOT EXISTS" solo funciona en versiones recientes (MariaDB 10.2+, MySQL 8.0+).
        // Si es MySQL 5.7, "IF NOT EXISTS" en ADD COLUMN fallará de sintaxis o lógica.
        // Para seguridad, envolvemos en try/catch específico.
        
        // Quitamos "IF NOT EXISTS" si da problemas de sintaxis en versiones viejas, 
        // pero asumiremos MySQL 8 o MariaDB moderno.
        await pool.query(statement);
        console.log(`✅ Sentencia ${i + 1} ejecutada correctamente.`);
      } catch (error) {
        // Ignorar errores de "Duplicate column" o "Unknown column" si es un ALTER que ya se hizo
        if (error.code === 'ER_DUP_FIELDNAME' || error.message.includes('Duplicate column')) {
            console.log(`⚠️  Sentencia ${i + 1} omitida: La columna ya existe.`);
        } else if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
            console.log(`⚠️  Sentencia ${i + 1} omitida: No se puede modificar campo.`);
        } else {
            console.error(`❌ Error en sentencia ${i + 1}:`, error.message);
            // No salimos, intentamos las siguientes
        }
      }
    }

    console.log('\n✅ Actualización completada.\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error fatal actualizando la base de datos:', error);
    process.exit(1);
  }
}

updateDatabase();
