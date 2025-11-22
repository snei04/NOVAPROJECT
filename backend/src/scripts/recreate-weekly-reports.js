import pool from '../config/database.js';

const recreateWeeklyReportsTable = async () => {
  const connection = await pool.getConnection();
  try {
    console.log('⚠️ Eliminando tabla weekly_reports existente...');
    await connection.query('DROP TABLE IF EXISTS weekly_reports');
    console.log('✅ Tabla eliminada.');

    console.log('🛠️ Creando tabla weekly_reports con estructura correcta...');
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
        FOREIGN KEY (project_id) REFERENCES boards(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Tabla weekly_reports recreada exitosamente.');
  } catch (error) {
    console.error('❌ Error recreando tabla:', error);
  } finally {
    connection.release();
    process.exit();
  }
};

recreateWeeklyReportsTable();
