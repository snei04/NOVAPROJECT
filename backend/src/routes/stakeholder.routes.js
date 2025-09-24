import { Router } from 'express';
import { getAllStakeholdersByBoard, createInterview } from '../controllers/stakeholder.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { isBoardMember } from '../middleware/boardAuth.middleware.js';

const router = Router();

// El endpoint para obtener todos los stakeholders de un tablero específico
router.get(
  '/:boardId/stakeholders',
  protect,
  isBoardMember,
  getAllStakeholdersByBoard
);

router.post('/:boardId/interviews', protect, isBoardMember, createInterview);

export default router;