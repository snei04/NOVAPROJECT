import express from 'express';
import {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  archiveDocument,
  getChildDocuments,
  inviteCollaborator
} from '../controllers/documentsController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(protect);

/**
 * @route   GET /api/documents
 * @desc    Obtener todos los documentos del usuario (propios o compartidos)
 * @access  Private
 */
router.get('/', getAllDocuments);

/**
 * @route   GET /api/documents/:id
 * @desc    Obtener un documento específico por ID
 * @access  Private
 */
router.get('/:id', getDocumentById);

/**
 * @route   GET /api/documents/children/:parentId
 * @desc    Obtener documentos hijos de un documento padre
 * @access  Private
 */
router.get('/children/:parentId', getChildDocuments);

/**
 * @route   POST /api/documents
 * @desc    Crear un nuevo documento
 * @access  Private
 */
router.post('/', createDocument);

/**
 * @route   POST /api/documents/:id/invite
 * @desc    Invitar a un colaborador
 * @access  Private
 */
router.post('/:id/invite', inviteCollaborator);

/**
 * @route   PUT /api/documents/:id
 * @desc    Actualizar un documento existente
 * @access  Private
 */
router.put('/:id', updateDocument);

/**
 * @route   DELETE /api/documents/:id
 * @desc    Archivar un documento (soft delete)
 * @access  Private
 */
router.delete('/:id', archiveDocument);

export default router;
