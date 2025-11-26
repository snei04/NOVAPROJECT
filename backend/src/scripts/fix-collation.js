import pool from '../config/database.js';

async function fixCollation() {
  try {
    console.log('🔧 Fixing collation mismatch...');
    
    // Option 1: Convert the specific column
    // await pool.query("ALTER TABLE budget_items MODIFY milestone_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci");
    
    // Option 2: Convert the whole table (safer for consistency)
    await pool.query("ALTER TABLE budget_items CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci");
    
    console.log('✅ budget_items converted to utf8mb4_0900_ai_ci');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing collation:', error);
    process.exit(1);
  }
}

fixCollation();
