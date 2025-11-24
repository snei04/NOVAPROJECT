
import dotenv from 'dotenv';
dotenv.config();
import pool from '../config/database.js';

const addProjectScopeFields = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Adding scope fields to boards table...');

    // Check if column exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'boards' AND COLUMN_NAME = 'general_objective'
    `, [process.env.DB_DATABASE]);

    if (columns.length === 0) {
      await connection.query(`
        ALTER TABLE boards 
        ADD COLUMN general_objective TEXT,
        ADD COLUMN scope_definition TEXT,
        ADD COLUMN specific_objectives JSON
      `);
      console.log('Added general_objective, scope_definition, specific_objectives columns.');
    } else {
      console.log('Scope columns already exist.');
    }

    console.log('Migration completed.');
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error adding scope fields:', error);
    process.exit(1);
  }
};

addProjectScopeFields();
