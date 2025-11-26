import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 🚀 Script de Migración V1 → V2
 * 
 * Este script actualiza la base de datos de NovaProject V1 a V2.
 * Ejecuta migraciones en orden seguro y verifica cada paso.
 */

const migrateV1toV2 = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔄 Iniciando migración de NovaProject V1 → V2...\n');

    // ========================================
    // PASO 1: Verificar versión actual
    // ========================================
    console.log('📋 PASO 1: Verificando versión actual...');
    
    const [versionTable] = await connection.query(
      "SHOW TABLES LIKE 'schema_version'"
    );
    
    let currentVersion = 1;
    if (versionTable.length > 0) {
      const [versionRow] = await connection.query(
        'SELECT version FROM schema_version ORDER BY applied_at DESC LIMIT 1'
      );
      currentVersion = versionRow[0]?.version || 1;
    } else {
      // Crear tabla de versiones si no existe
      await connection.query(`
        CREATE TABLE schema_version (
          id INT AUTO_INCREMENT PRIMARY KEY,
          version INT NOT NULL,
          description VARCHAR(255),
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await connection.query(
        'INSERT INTO schema_version (version, description) VALUES (1, "Base V1")'
      );
    }
    
    console.log(`✅ Versión actual: V${currentVersion}\n`);
    
    if (currentVersion >= 2) {
      console.log('⚠️  La base de datos ya está en V2 o superior. No se requiere migración.');
      return;
    }

    // ========================================
    // PASO 2: Backup de seguridad
    // ========================================
    console.log('📋 PASO 2: Creando backup de seguridad...');
    console.log('⚠️  IMPORTANTE: Ejecuta manualmente este comando ANTES de continuar:');
    console.log('   mysqldump -u root -p novaproject_db > backup_v1_$(date +%Y%m%d_%H%M%S).sql\n');
    
    // Esperar confirmación del usuario (en producción, implementar prompt)
    console.log('⏸️  Presiona Ctrl+C si NO has hecho el backup. Continuando en 5 segundos...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // ========================================
    // PASO 3: Crear tabla weekly_reports
    // ========================================
    console.log('📋 PASO 3: Creando tabla weekly_reports...');
    
    const [weeklyReportsExists] = await connection.query(
      "SHOW TABLES LIKE 'weekly_reports'"
    );
    
    if (weeklyReportsExists.length === 0) {
      await connection.query(`
        CREATE TABLE weekly_reports (
          id INT AUTO_INCREMENT PRIMARY KEY,
          project_id INT NOT NULL,
          week_number INT NOT NULL,
          year INT NOT NULL,
          start_date DATE,
          end_date DATE,
          status ENUM('pending', 'submitted', 'approved', 'late') DEFAULT 'pending',
          achievements TEXT,
          challenges TEXT,
          goals_next_week TEXT,
          progress_snapshot INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES boards(id) ON DELETE CASCADE,
          INDEX idx_project_week (project_id, week_number, year)
        )
      `);
      console.log('✅ Tabla weekly_reports creada.\n');
    } else {
      console.log('⚠️  Tabla weekly_reports ya existe. Verificando columnas...');
      
      // Verificar si tiene todas las columnas necesarias
      const [columns] = await connection.query('DESCRIBE weekly_reports');
      const columnNames = columns.map(c => c.Field);
      
      const requiredColumns = ['achievements', 'challenges', 'goals_next_week'];
      const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
      
      if (missingColumns.length > 0) {
        console.log(`⚠️  Faltan columnas: ${missingColumns.join(', ')}. Recreando tabla...`);
        await connection.query('DROP TABLE weekly_reports');
        await connection.query(`
          CREATE TABLE weekly_reports (
            id INT AUTO_INCREMENT PRIMARY KEY,
            project_id INT NOT NULL,
            week_number INT NOT NULL,
            year INT NOT NULL,
            start_date DATE,
            end_date DATE,
            status ENUM('pending', 'submitted', 'approved', 'late') DEFAULT 'pending',
            achievements TEXT,
            challenges TEXT,
            goals_next_week TEXT,
            progress_snapshot INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES boards(id) ON DELETE CASCADE,
            INDEX idx_project_week (project_id, week_number, year)
          )
        `);
        console.log('✅ Tabla weekly_reports recreada con estructura correcta.\n');
      } else {
        console.log('✅ Tabla weekly_reports tiene todas las columnas necesarias.\n');
      }
    }

    // ========================================
    // PASO 4: Añadir columnas nuevas a tablas existentes (si aplica)
    // ========================================
    console.log('📋 PASO 4: Verificando columnas en tablas existentes...');
    
    // Ejemplo: Verificar si deliverables tiene columna 'evidence_link'
    const [delivColumns] = await connection.query('DESCRIBE deliverables');
    const delivColumnNames = delivColumns.map(c => c.Field);
    
    if (!delivColumnNames.includes('evidence_link')) {
      console.log('⚠️  Añadiendo columna evidence_link a deliverables...');
      await connection.query(
        'ALTER TABLE deliverables ADD COLUMN evidence_link VARCHAR(500) AFTER description'
      );
      console.log('✅ Columna evidence_link añadida.\n');
    } else {
      console.log('✅ Tabla deliverables ya tiene evidence_link.\n');
    }

    // ========================================
    // PASO 5: Migrar datos existentes (si aplica)
    // ========================================
    console.log('📋 PASO 5: Migrando datos existentes...');
    console.log('✅ No hay transformaciones de datos necesarias para esta migración.\n');

    // ========================================
    // PASO 6: Registrar versión V2
    // ========================================
    console.log('📋 PASO 6: Registrando migración a V2...');
    await connection.query(
      'INSERT INTO schema_version (version, description) VALUES (2, "V2: Weekly Reports + Dashboard")'
    );
    console.log('✅ Versión V2 registrada.\n');

    // ========================================
    // RESUMEN FINAL
    // ========================================
    console.log('🎉 ¡Migración completada exitosamente!');
    console.log('📊 Resumen de cambios:');
    console.log('   - Tabla weekly_reports creada/actualizada');
    console.log('   - Columna evidence_link verificada en deliverables');
    console.log('   - Base de datos actualizada a V2\n');
    
    console.log('🔍 Próximos pasos:');
    console.log('   1. Reinicia el servidor backend (npm run dev)');
    console.log('   2. Prueba crear un reporte semanal en el Dashboard');
    console.log('   3. Verifica que todos los módulos funcionen correctamente\n');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    console.error('🔄 Restaura el backup si es necesario:');
    console.error('   mysql -u root -p novaproject_db < backup_v1_YYYYMMDD_HHMMSS.sql');
    throw error;
  } finally {
    connection.release();
    process.exit();
  }
};

migrateV1toV2();
