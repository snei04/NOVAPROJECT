import { Router } from 'express';
import {
    createBoard,
    getMyBoards,
    getBoard,
    deleteBoard,
    updateBoard,
    addMember,
    getBoardActivity,
    createBoardAssociation,
    getBoardAssociations
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
  .get(protect, getBoard)         // <-- Para VER, solo se necesita ser miembro
  .put(protect, isBoardOwner, updateBoard)       // <-- Para EDITAR, se necesita ser dueño
  .delete(protect, isBoardOwner, deleteBoard);

router.post('/:boardId/members', protect, isBoardOwner, addMember);

// Rutas para obtener datos RELACIONADOS a un tablero
router.get('/:boardId/activity', protect, isBoardMember, getBoardActivity);
router.get('/:boardId/labels', protect, isBoardMember, getLabelsByBoard);
//Rutas para la asociacion de un tablero
router.route('/:boardId/associations')
  .get(protect, isBoardMember, getBoardAssociations)
  .post(protect, isBoardOwner, createBoardAssociation);

export default router;