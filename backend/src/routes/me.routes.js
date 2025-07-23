import { Router } from 'express';
import { getMyProfile, getMyBoards, getMyTasks, updateMyProfile   } from '../controllers/me.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();
router.use(protect);
// Protegemos la ruta para que solo usuarios logueados puedan acceder
router.route('/profile')
  .get(getMyProfile)
  .put(updateMyProfile);
router.get('/boards', protect, getMyBoards);
router.get('/tasks', protect, getMyTasks);

export default router;