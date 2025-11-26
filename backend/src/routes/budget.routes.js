import { Router } from 'express';
import { 
  getBudgetItems, 
  createBudgetItem, 
  updateBudgetItem, 
  deleteBudgetItem, 
  getBudgetSummary 
} from '../controllers/budget.controller.js';
import { protect } from '../middleware/auth.middleware.js';
// import { isBoardMember, isBoardOwner } from '../middleware/boardAuth.middleware.js'; 
// Nota: Para simplicidad en v2, usaremos protect. 
// Idealmente deberíamos validar permisos de tablero, pero budget.controller usa boardId como param.

const router = Router();

router.use(protect);

// Rutas por proyecto
router.get('/project/:boardId', getBudgetItems);
router.post('/project/:boardId', createBudgetItem);
router.get('/project/:boardId/summary', getBudgetSummary);

// Rutas por item
router.put('/:id', updateBudgetItem);
router.delete('/:id', deleteBudgetItem);

export default router;
