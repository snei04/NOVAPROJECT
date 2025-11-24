import { Router } from 'express';
import { getUsers, searchUsers } from '../controllers/user.controller.js';

// Creamos una instancia del enrutador de Express
const router = Router();

// Búsqueda de usuarios (debe ir antes de rutas dinámicas si las hubiera)
router.get('/search', searchUsers);

// Definimos la ruta para obtener todos los usuarios
// Cuando se haga una petición GET a '/', se ejecutará la función getUsers
router.get('/', getUsers);

// Exportamos el enrutador para usarlo en nuestro archivo principal
export default router;