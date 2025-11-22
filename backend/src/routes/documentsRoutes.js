import express from 'express';
import {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  archiveDocument,
  getChildDocuments
} from '../controllers/documentsController.js';

const router = express.Router();

/**
 * @route   GET /api/documents
 * @desc    Obtener todos los documentos no archivados
 * @access  Public (agregar autenticación si es necesario)
 */
router.get('/', getAllDocuments);

/**
 * @route   GET /api/documents/:id
 * @desc    Obtener un documento específico por ID
 * @access  Public
 */
router.get('/:id', getDocumentById);

/**
 * @route   GET /api/documents/children/:parentId
 * @desc    Obtener documentos hijos de un documento padre
 * @access  Public
 */
router.get('/children/:parentId', getChildDocuments);

/**
 * @route   POST /api/documents
 * @desc    Crear un nuevo documento
 * @access  Public
 */
router.post('/', createDocument);

/**
 * @route   PUT /api/documents/:id
 * @desc    Actualizar un documento existente
 * @access  Public
 */
router.put('/:id', updateDocument);

/**
 * @route   DELETE /api/documents/:id
 * @desc    Archivar un documento (soft delete)
 * @access  Public
 */
router.delete('/:id', archiveDocument);

export default router;
