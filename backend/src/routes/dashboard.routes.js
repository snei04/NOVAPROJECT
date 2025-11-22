import express from 'express';
import { getProjectDashboard, createWeeklyReport } from '../controllers/dashboard.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/:projectId', getProjectDashboard);
router.post('/reports', createWeeklyReport);

export default router;
