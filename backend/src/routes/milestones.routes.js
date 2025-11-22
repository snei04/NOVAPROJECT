import express from 'express';
import {
  getMilestonesByProject,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  getProjectMetrics
} from '../controllers/milestones.controller.js';

const router = express.Router();

/**
 * @route   GET /api/milestones/project/:projectId
 * @desc    Obtener todos los milestones de un proyecto
 * @access  Public (agregar autenticación si es necesario)
 */
router.get('/project/:projectId', getMilestonesByProject);

/**
 * @route   GET /api/milestones/metrics/:projectId
 * @desc    Obtener métricas calculadas del proyecto
 * @access  Public
 */
router.get('/metrics/:projectId', getProjectMetrics);

/**
 * @route   POST /api/milestones
 * @desc    Crear un nuevo milestone
 * @access  Public
 */
router.post('/', createMilestone);

/**
 * @route   PUT /api/milestones/:id
 * @desc    Actualizar un milestone
 * @access  Public
 */
router.put('/:id', updateMilestone);

/**
 * @route   DELETE /api/milestones/:id
 * @desc    Eliminar un milestone
 * @access  Public
 */
router.delete('/:id', deleteMilestone);

export default router;
