
import dotenv from 'dotenv';
dotenv.config();
import pool from '../config/database.js';

const addFinancialFields = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Checking/Adding financial fields to boards table...');

    // Check if columns exist
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'boards' AND COLUMN_NAME IN ('budget_estimated', 'budget_actual', 'project_benefit')
    `, [process.env.DB_DATABASE]);

    const existingColumns = columns.map(c => c.COLUMN_NAME);

    if (!existingColumns.includes('budget_estimated')) {
      await connection.query(`
        ALTER TABLE boards 
        ADD COLUMN budget_estimated DECIMAL(15,2) DEFAULT 0 COMMENT 'Presupuesto Base (Proyección)'
      `);
      console.log('Added budget_estimated column.');
    }

    if (!existingColumns.includes('budget_actual')) {
      await connection.query(`
        ALTER TABLE boards 
        ADD COLUMN budget_actual DECIMAL(15,2) DEFAULT 0 COMMENT 'Costos Reales (Ejecutado)'
      `);
      console.log('Added budget_actual column.');
    }

    if (!existingColumns.includes('project_benefit')) {
      await connection.query(`
        ALTER TABLE boards 
        ADD COLUMN project_benefit DECIMAL(15,2) DEFAULT 0 COMMENT 'Beneficio/Impacto del Proyecto'
      `);
      console.log('Added project_benefit column.');
    }

    console.log('Financial fields migration completed.');
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error adding financial fields:', error);
    process.exit(1);
  }
};

addFinancialFields();
