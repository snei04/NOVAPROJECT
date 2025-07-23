import LabelService from '../services/label.service.js';
import pool from '../config/database.js'; // Aún lo necesitamos para los permisos

// Crear una nueva etiqueta para un tablero
export const createLabel = async (req, res) => {
  try {
    const { boardId, name, color } = req.body;
    const userId = req.user.id;

    // --- VERIFICACIÓN DE PERMISOS CORRECTA ---
    const [boardRows] = await pool.query('SELECT user_id FROM boards WHERE id = ?', [boardId]);
    if (boardRows.length === 0) {
        return res.status(404).json({ message: 'Tablero no encontrado.' });
    }

    const isOwner = boardRows[0].user_id === userId;
    if (!isOwner) {
        // En el futuro, podríamos revisar si tiene un rol de 'owner' en board_members también.
        // Por ahora, solo el dueño original puede crear etiquetas.
        return res.status(403).json({ message: 'Solo los dueños del tablero pueden crear y gestionar etiquetas.' });
    }
    // --- FIN DE LA VERIFICACIÓN ---

    const newLabel = await LabelService.createLabel({ name, color, boardId });
    res.status(201).json(newLabel);
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Asignar una etiqueta a una tarjeta
export const assignLabelToCard = async (req, res) => {
  try {
    const { cardId, labelId } = req.body;
    const userId = req.user.id;

    // (La verificación de permisos se mantiene aquí para asegurar que el usuario tiene acceso)
    const [rows] = await pool.query(`
      SELECT c.id FROM cards c
      INNER JOIN lists l ON c.list_id = l.id
      INNER JOIN labels lab ON l.board_id = lab.board_id
      WHERE c.id = ? AND lab.id = ? AND l.board_id IN (SELECT board_id FROM board_members WHERE user_id = ?)
    `, [cardId, labelId, userId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Tarjeta o etiqueta no encontrada, o no tiene permiso.' });
    }

    await LabelService.assignLabelToCard({ cardId, labelId });
    res.status(201).json({ message: 'Etiqueta asignada a la tarjeta exitosamente' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Esta etiqueta ya está asignada a la tarjeta' });
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Quitar una etiqueta de una tarjeta
export const removeLabelFromCard = async (req, res) => {
  try {
    const { cardId, labelId } = req.params;
    // (Aquí iría una verificación de permisos similar a la de 'assign')
    await LabelService.removeLabelFromCard({ cardId, labelId });
    res.status(200).json({ message: 'Etiqueta eliminada de la tarjeta exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar una etiqueta
export const updateLabel = async (req, res) => {
  try {
    const { id } = req.params;
    // (Aquí iría una verificación de permisos)
    await LabelService.updateLabel(id, req.body);
    res.status(200).json({ message: 'Etiqueta actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener todas las etiquetas de un tablero
export const getLabelsByBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    // (Los permisos para esta ruta ya se verifican en el middleware 'isBoardMember')
    const labels = await LabelService.getLabelsByBoard(boardId);
    res.status(200).json(labels);
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};