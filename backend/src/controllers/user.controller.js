// Importamos el pool de conexiones que creamos anteriormente
import pool from '../config/database.js';

// Controlador para obtener todos los usuarios
export const getUsers = async (req, res) => {
  try {
    // Ejecutamos una consulta SQL para seleccionar todos los usuarios
    const [rows] = await pool.query('SELECT id, nombre, email, avatar FROM usuarios');

    // Respondemos a la solicitud con un estado 200 (OK) y los usuarios en formato JSON
    res.status(200).json(rows);

  } catch (error) {
    // Si hay un error, lo mostramos en la consola
    console.error('Error al obtener los usuarios:', error);
    // Y enviamos una respuesta de error al cliente
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Aquí añadiremos más funciones (crear, actualizar, etc.) en el futuro