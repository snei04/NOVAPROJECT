// src/routes/list.routes.js
import { Router } from 'express';
import { createList, deleteList  } from '../controllers/list.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Todas las rutas aquí estarán protegidas
router.use(protect);

router.route('/')
  .post(createList);
router.route('/:id')
  .delete(deleteList);

export default router;