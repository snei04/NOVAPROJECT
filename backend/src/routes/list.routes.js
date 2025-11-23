// src/routes/list.routes.js
import { Router } from 'express';
import { createList, updateList, deleteList } from '../controllers/list.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { isBoardOwner, isBoardMember } from '../middleware/boardAuth.middleware.js';



const router = Router();

// Todas las rutas aquí estarán protegidas
router.use(protect);

router.route('/')
  .post(createList);
router.route('/:id').put(isBoardMember, updateList).delete(isBoardOwner, deleteList);

  

export default router;