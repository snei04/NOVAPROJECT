
import dotenv from 'dotenv';
dotenv.config();
import pool from '../config/database.js';

const createTable = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS deliverable_boards (
        deliverable_id VARCHAR(36) NOT NULL,
        board_id VARCHAR(36) NOT NULL, -- Assuming boards.id is UUID
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (deliverable_id, board_id),
        INDEX idx_board (board_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table deliverable_boards created or already exists.');
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error creating table:', error);
    process.exit(1);
  }
};

createTable();
