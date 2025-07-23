import { Router } from 'express';
import { getUsers } from '../controllers/user.controller.js';

// Creamos una instancia del enrutador de Express
const router = Router();

// Definimos la ruta para obtener todos los usuarios
// Cuando se haga una petición GET a '/', se ejecutará la función getUsers
router.get('/', getUsers);

// Exportamos el enrutador para usarlo en nuestro archivo principal
export default router;