import { Router } from 'express';
import {
    createBoard,
    getMyBoards,
    getBoard,
    deleteBoard,
    addMember,
    getBoardActivity
} from '../controllers/board.controller.js';
import { getLabelsByBoard } from '../controllers/label.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { isBoardMember, isBoardOwner } from '../middleware/boardAuth.middleware.js';

const router = Router();

// Rutas generales que solo requieren que el usuario esté autenticado
router.route('/')
  .post(protect, createBoard)
  .get(protect, getMyBoards);

// --- ESTA ES LA PARTE IMPORTANTE ---
// Rutas que operan sobre un tablero específico
router.route('/:id')
  .get(protect, isBoardMember, getBoard) // <-- GET /boards/:id usa getBoard
  .delete(protect, isBoardMember, isBoardOwner, deleteBoard);

router.post('/:boardId/members', protect, isBoardMember, isBoardOwner, addMember);

// Rutas para obtener datos RELACIONADOS a un tablero
router.get('/:boardId/activity', protect, isBoardMember, getBoardActivity);
router.get('/:boardId/labels', protect, isBoardMember, getLabelsByBoard);

export default router;