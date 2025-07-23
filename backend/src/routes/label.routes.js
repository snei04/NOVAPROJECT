import { Router } from 'express';
import { createLabel, assignLabelToCard, removeLabelFromCard, updateLabel } from '../controllers/label.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();
router.use(protect);

router.route('/')
    .post(createLabel);

router.route('/:id')
    .put(updateLabel);

router.post('/assign', assignLabelToCard);
router.delete('/assign/:cardId/:labelId', removeLabelFromCard);

export default router;