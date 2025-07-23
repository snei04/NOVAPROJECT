import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes.js';
import authRoutes from './routes/auth.routes.js';
import boardRoutes from './routes/board.routes.js';
import listRoutes from './routes/list.routes.js';
import cardRoutes from './routes/card.routes.js';
import meRoutes from './routes/me.routes.js';
import labelRoutes from './routes/label.routes.js'; 
import cors from 'cors';

// Cargamos las variables de entorno
dotenv.config();


// Creamos la aplicación Express
const app = express();
app.use(cors());

// --- Middlewares ---
app.use(express.json());

// --- Rutas ---
// Montamos las rutas de autenticación en el prefijo /api/v1/auth
app.use('/api/v1/auth', authRoutes); // <-- 2. Usa las rutas de auth
// Montamos las rutas de usuarios en el prefijo /api/v1/users
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/boards', boardRoutes); 
app.use('/api/v1/lists', listRoutes);
app.use('/api/v1/cards', cardRoutes);
app.use('/api/v1/me', meRoutes);
app.use('/api/v1/labels', labelRoutes);

// Definimos el puerto en el que escuchará el servidor
const PORT = process.env.PORT || 3000;

// Iniciamos el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});