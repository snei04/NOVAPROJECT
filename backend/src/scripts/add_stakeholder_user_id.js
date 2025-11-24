
import dotenv from 'dotenv';
dotenv.config();
import pool from '../config/database.js';

const addStakeholderUserId = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Checking/Adding user_id to stakeholders table...');

    // Check if column exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'stakeholders' AND COLUMN_NAME = 'user_id'
    `, [process.env.DB_DATABASE]);

    if (columns.length === 0) {
      await connection.query(`
        ALTER TABLE stakeholders 
        ADD COLUMN user_id INT AFTER project_id,
        ADD CONSTRAINT fk_stakeholder_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE SET NULL
      `);
      console.log('Added user_id column to stakeholders (INT).');
    } else {
      console.log('user_id column already exists.');
    }

    console.log('Migration completed.');
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error adding user_id to stakeholders:', error);
    process.exit(1);
  }
};

addStakeholderUserId();
