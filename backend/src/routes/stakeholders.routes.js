import express from 'express';
import {
  getStakeholdersByProject,
  getStakeholderAvailability,
  addStakeholderAvailability,
  updateStakeholderAvailability,
  getMeetingsByProject,
  createMeeting,
  updateMeetingStatus,
  findOptimalSlots,
  createStakeholder,
  getAllStakeholders,
  createActionItem,
  updateActionItemStatus
} from '../controllers/stakeholders.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/stakeholders/action-items
 * @desc    Crear un compromiso (Action Item)
 * @access  Public
 */
router.post('/action-items', createActionItem);

/**
 * @route   PUT /api/stakeholders/action-items/:id/status
 * @desc    Actualizar estado de un compromiso
 * @access  Public
 */
router.put('/action-items/:id/status', updateActionItemStatus);

/**
 * @route   GET /api/stakeholders
 * @desc    Obtener todos los stakeholders visibles por el usuario
 * @access  Public (Debug)
 */
router.get('/', getAllStakeholders);

/**
 * @route   POST /api/stakeholders
 * @desc    Crear un nuevo stakeholder
 * @access  Public (pero debería ser Private si se asocia a proyecto)
 */
router.post('/', createStakeholder);

/**
 * @route   GET /api/stakeholders/project/:projectId
 * @desc    Obtener todos los stakeholders de un proyecto
 * @access  Public
 */
router.get('/project/:projectId', getStakeholdersByProject);

/**
 * @route   GET /api/stakeholders/:stakeholderId/availability
 * @desc    Obtener disponibilidad de un stakeholder
 * @access  Public
 */
router.get('/:stakeholderId/availability', getStakeholderAvailability);

/**
 * @route   POST /api/stakeholders/:stakeholderId/availability
 * @desc    Añadir disponibilidad a un stakeholder
 * @access  Public
 */
router.post('/:stakeholderId/availability', addStakeholderAvailability);

/**
 * @route   PUT /api/stakeholders/:stakeholderId/availability
 * @desc    Actualizar disponibilidad de un stakeholder (Reemplaza por día)
 * @access  Public
 */
router.put('/:stakeholderId/availability', updateStakeholderAvailability);

/**
 * @route   GET /api/stakeholders/meetings/:projectId
 * @desc    Obtener reuniones de un proyecto
 * @access  Public
 */
router.get('/meetings/:projectId', getMeetingsByProject);

/**
 * @route   POST /api/stakeholders/meetings
 * @desc    Crear una nueva reunión
 * @access  Public
 */
router.post('/meetings', createMeeting);

/**
 * @route   PUT /api/stakeholders/meetings/:id/status
 * @desc    Actualizar estado de una reunión
 * @access  Public
 */
router.put('/meetings/:id/status', updateMeetingStatus);

/**
 * @route   POST /api/stakeholders/find-slots/:projectId
 * @desc    Buscar slots óptimos para reunión
 * @access  Public
 */
router.post('/find-slots/:projectId', findOptimalSlots);

export default router;
