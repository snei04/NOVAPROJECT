import express from 'express';
import { getDeliverablesByProject, createDeliverable, updateDeliverable, deleteDeliverable } from '../controllers/deliverables.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/project/:projectId', getDeliverablesByProject);
router.post('/', createDeliverable);
router.put('/:id', updateDeliverable);
router.delete('/:id', deleteDeliverable);

export default router;
