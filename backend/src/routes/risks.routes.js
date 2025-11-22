import express from 'express';
import { getRisksByProject, createRisk, updateRisk, deleteRisk } from '../controllers/risks.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Todas las rutas protegidas
router.use(protect);

router.get('/project/:projectId', getRisksByProject);
router.post('/', createRisk);
router.put('/:id', updateRisk);
router.delete('/:id', deleteRisk);

export default router;
