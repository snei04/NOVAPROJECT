
import dotenv from 'dotenv';
dotenv.config();
import pool from '../config/database.js';

const checkDocuments = async () => {
  try {
    const [rows] = await pool.query('SHOW FULL COLUMNS FROM documents');
    console.log('documents table columns:', rows);
    process.exit(0);
  } catch (error) {

    console.error(error);
    process.exit(1);
  }
};
checkDocuments();
