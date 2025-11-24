
import dotenv from 'dotenv';
dotenv.config();
import pool from '../config/database.js';

const makeBoardsIndependent = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Making boards independent of creator...');

    // 1. Drop foreign key
    // We know the name is boards_ibfk_1 from SHOW CREATE TABLE
    try {
        await connection.query('ALTER TABLE boards DROP FOREIGN KEY boards_ibfk_1');
        console.log('Dropped FK boards_ibfk_1');
    } catch (e) {
        console.log('FK might not exist or different name, trying generic approach not recommended without verifying name.');
        // Assuming success from previous step check
    }

    // 2. Modify column to be nullable
    await connection.query('ALTER TABLE boards MODIFY COLUMN user_id INT NULL');
    console.log('Modified user_id to be NULLABLE');

    // 3. Add FK with ON DELETE SET NULL
    await connection.query(`
        ALTER TABLE boards 
        ADD CONSTRAINT fk_boards_user_independent 
        FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE SET NULL
    `);
    console.log('Added new FK with ON DELETE SET NULL');

    console.log('Migration completed.');
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error making boards independent:', error);
    process.exit(1);
  }
};

makeBoardsIndependent();
