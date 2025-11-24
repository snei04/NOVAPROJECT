
import dotenv from 'dotenv';
dotenv.config();
import pool from '../config/database.js';

const checkBoards = async () => {
  try {
    const [rows] = await pool.query('DESCRIBE boards');
    console.log('boards table structure:', rows);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
checkBoards();
