// src/services/card.service.js
import pool from '../config/database.js';
import ActivityService from './activity.service.js';
import DeliverableService from './deliverable.service.js';

class CardService {
  async createCard({ title, listId, position, description, dueDate }) {
    const mysqlDate = dueDate ? new Date(dueDate).toISOString().slice(0, 19).replace('T', ' ') : null;
    const [result] = await pool.query(
      'INSERT INTO cards (title, list_id, position, description, due_date) VALUES (?, ?, ?, ?, ?)',
      [title, listId, position, description || null, mysqlDate]
    );
    return { id: result.insertId, title, list_id: listId, position, description, due_date: mysqlDate };
  }

 async updateCard(cardId, updates, user) {
  try {
    console.log('--- 2. Servicio updateCard INICIADO ---');
    
    // --- 1. Lógica para actualizar la tarjeta (tu código está bien aquí) ---
    const fieldsToUpdate = [];
    const values = [];

    for (const key in updates) {
      if (updates[key] !== undefined) {
        let field = key;
        let value = updates[key];
        if (key === 'dueDate') {
          field = 'due_date';
          value = value ? new Date(value).toISOString().slice(0, 19).replace('T', ' ') : null;
        }
        if (key === 'listId') field = 'list_id';
        if (key === 'isCompleted') field = 'is_completed';
        fieldsToUpdate.push(`${field} = ?`);
        values.push(value);
      }
    }

    if (fieldsToUpdate.length > 0) {
      values.push(cardId);
      const query = `UPDATE cards SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
      await pool.query(query, values);
    }

    // --- 2. Lógica para registrar la actividad (sección corregida) ---
    console.log('--- 3. Preparando datos para el log de actividad ---');

    // Obtenemos los datos necesarios para la descripción del log
    const [cardDataRows] = await pool.query('SELECT c.title, l.board_id FROM cards c JOIN lists l ON c.list_id = l.id WHERE c.id = ?', [cardId]);
    if (cardDataRows.length === 0) {
      // Si no encontramos la tarjeta, no podemos registrar la actividad
      return; 
    }
    const cardData = cardDataRows[0];
    const userName = user.name || 'Un usuario'; // Definimos userName aquí
    
    // Creamos la descripción
    let activityDescription = `${userName} actualizó la tarjeta "${cardData.title}"`;
    if (updates.listId) {
      activityDescription = `${userName} movió la tarjeta "${cardData.title}"`;
    }
    
    // Llamamos al servicio de actividad
    console.log('--- 4. Llamando a ActivityService.logActivity ---');
    await ActivityService.logActivity({
      description: activityDescription,
      boardId: cardData.board_id,
      userId: user.id
    });

    // --- 5. Verificar entregables vinculados ---
    console.log('--- 5. Verificando entregables vinculados ---');
    // No esperamos a que termine para no bloquear la respuesta, o sí?
    // Mejor esperamos para asegurar consistencia.
    await DeliverableService.checkAndCompleteDeliverables(cardData.board_id);

  } catch (error) {
    // Este catch ahora maneja cualquier error que ocurra en la función
    console.error('Error en la función updateCard:', error);
    throw error; // Lanzamos el error para que el controlador lo atrape
  }
}
  }

export default new CardService();