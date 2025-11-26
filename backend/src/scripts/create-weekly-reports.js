import pool from '../config/database.js';

const createWeeklyReportsTable = async () => {
  const connection = await pool.getConnection();
  try {
    console.log('Creando tabla weekly_reports...');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS weekly_reports (
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

    console.log('Tabla weekly_reports creada.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    connection.release();
    process.exit();
  }
};

createWeeklyReportsTable();
