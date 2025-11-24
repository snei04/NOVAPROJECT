
import dotenv from 'dotenv';
dotenv.config();
import pool from '../config/database.js';

const checkBoardMembers = async () => {
  try {
    const [rows] = await pool.query('DESCRIBE board_members');
    console.log('board_members table structure:', rows);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
checkBoardMembers();
