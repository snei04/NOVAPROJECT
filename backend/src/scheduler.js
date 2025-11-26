import cron from 'node-cron';
import pool from './config/database.js';
import { sendMail } from './services/mail.service.js';

// Esta función buscará las tareas que vencen "mañana"
const checkDueDates = async () => {
  console.log('Ejecutando el verificador de fechas de vencimiento...');

  // Obtenemos la fecha de mañana en formato YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowString = tomorrow.toISOString().split('T')[0];

  try {
    // Consulta para obtener tareas que vencen mañana, junto con el email del asignado
    const [tasks] = await pool.query(`
      SELECT 
        c.title as cardTitle, 
        b.title as boardTitle, 
        u.email as userEmail, 
        u.nombre as userName
      FROM cards c
      JOIN card_assignees ca ON c.id = ca.card_id
      JOIN usuarios u ON ca.user_id = u.id
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      WHERE DATE(c.due_date) = ?
    `, [tomorrowString]);

    if (tasks.length > 0) {
      console.log(`Enviando ${tasks.length} recordatorios de vencimiento...`);
      for (const task of tasks) {
        const emailHtml = `
          <h1>Recordatorio: Tarea por Vencer</h1>
          <p>Hola ${task.userName},</p>
          <p>Solo un recordatorio de que tu tarea "<b>${task.cardTitle}</b>" en el tablero "<b>${task.boardTitle}</b>" vence mañana.</p>
        `;
        await sendMail(task.userEmail, `Recordatorio: Tu tarea "${task.cardTitle}" vence mañana`, emailHtml);
      }
    } else {
      console.log('No hay tareas que venzan mañana.');
    }
  } catch (error) {
    console.error('Error al verificar fechas de vencimiento:', error);
  }
};

// Programamos la tarea para que se ejecute todos los días a las 8:00 AM
// El formato es: (minuto hora día-del-mes mes día-de-la-semana)
cron.schedule('0 8 * * *', checkDueDates, {
  timezone: "America/Bogota"
});

console.log('Scheduler iniciado: Verificará vencimientos todos los días a las 8:00 AM.');