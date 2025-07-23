// src/controllers/me.controller.js
import pool from '../config/database.js';

export const getMyProfile = async (req, res) => {
  const userId = req.user.id; // ID del usuario que viene del token

  try {
   const [rows] = await pool.query(
      'SELECT id, nombre, email, avatar FROM usuarios WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Renombramos 'nombre' a 'name' para que coincida con el modelo User de Angular
    const userProfile = {
        id: rows[0].id,
        name: rows[0].nombre,
        email: rows[0].email,
        avatar: rows[0].avatar
    };

    res.status(200).json(userProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getMyBoards = async (req, res) => {
  const userId = req.user.id; // ID del usuario que viene del token

  try {
    // 1. Obtenemos los tableros que el usuario ha creado
    const [ownedBoards] = await pool.query(
      'SELECT * FROM boards WHERE user_id = ?',
      [userId]
    );

    // 2. Obtenemos los tableros donde el usuario es miembro (pero no el dueño)
    const [memberBoards] = await pool.query(`
      SELECT b.* FROM boards b
      INNER JOIN board_members bm ON b.id = bm.board_id
      WHERE bm.user_id = ? AND b.user_id != ?
    `, [userId, userId]);

    // 3. Enviamos una respuesta estructurada
    res.status(200).json({
      owned: ownedBoards,
      member: memberBoards
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getMyTasks = async (req, res) => {
  const userId = req.user.id;

  try {
    // Esta consulta busca todas las tarjetas asignadas al usuario
    // y se une con las tablas de listas y tableros para obtener contexto.
    const [tasks] = await pool.query(`
      SELECT 
        c.id AS card_id,
        c.title AS card_title,
        c.due_date,
        l.title AS list_title,
        b.id AS board_id,
        b.title AS board_title,
        b.backgroundColor
      FROM card_assignees ca
      INNER JOIN cards c ON ca.card_id = c.id
      INNER JOIN lists l ON c.list_id = l.id
      INNER JOIN boards b ON l.board_id = b.id
      WHERE ca.user_id = ?
    `, [userId]);

    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateMyProfile = async (req, res) => {
  const { name } = req.body; // Por ahora, solo permitiremos cambiar el nombre
  const userId = req.user.id;

  if (!name) {
    return res.status(400).json({ message: 'El nombre es requerido' });
  }

  try {
    // Generamos una nueva URL de avatar con el nuevo nombre
    const newAvatarUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`;

    await pool.query(
      'UPDATE usuarios SET nombre = ?, avatar = ? WHERE id = ?',
      [name, newAvatarUrl, userId]
    );

    res.status(200).json({ message: 'Perfil actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};