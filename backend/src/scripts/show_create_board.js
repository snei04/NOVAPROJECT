
import dotenv from 'dotenv';
dotenv.config();
import pool from '../config/database.js';

const showCreateBoard = async () => {
  try {
    const [rows] = await pool.query('SHOW CREATE TABLE boards');
    console.log('Create Table:', rows[0]['Create Table']);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
showCreateBoard();
