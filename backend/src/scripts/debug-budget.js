import pool from '../config/database.js';
import budgetService from '../services/budget.service.js';

async function debugBudget() {
  try {
    console.log('🔍 Testing getBudgetItems(7)...');
    const items = await budgetService.getBudgetItems(7);
    console.log('✅ Success:', items);
  } catch (error) {
    console.error('❌ Error:', error);
  }
  process.exit(0);
}

debugBudget();
