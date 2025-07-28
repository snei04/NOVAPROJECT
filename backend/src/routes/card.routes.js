// src/routes/card.routes.js
import { Router } from 'express';
import { createCard, updateCard, deleteCard, assignMemberToCard, removeMemberFromCard   } from '../controllers/card.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { isBoardOwner, isBoardMember } from '../middleware/boardAuth.middleware.js';

const router = Router();

// Todas las rutas aquí estarán protegidas por el middleware 'protect'
router.use(protect);

router.route('/')
  .post(createCard);

  router.route('/:id')
  router.route('/:id').put(protect, isBoardMember, updateCard)
  .delete(protect, isBoardOwner, deleteCard);
  router.post('/assign-member', assignMemberToCard);
  router.delete('/:cardId/remove-member/:userIdToRemove', removeMemberFromCard);

export default router;