import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes.js';
import authRoutes from './routes/auth.routes.js';
import boardRoutes from './routes/board.routes.js';
import listRoutes from './routes/list.routes.js';
import cardRoutes from './routes/card.routes.js';
import meRoutes from './routes/me.routes.js';
import labelRoutes from './routes/label.routes.js'; 
import documentsRoutes from './routes/documentsRoutes.js';
import milestonesRoutes from './routes/milestones.routes.js';
import stakeholdersRoutes from './routes/stakeholders.routes.js';
import risksRoutes from './routes/risks.routes.js';
import deliverablesRoutes from './routes/deliverables.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import budgetRoutes from './routes/budget.routes.js';
import cors from 'cors';
import './scheduler.js';
import stakeholderRoutes from './routes/stakeholder.routes.js';
import './config/database.js';  // Aseguramos la conexión a la base de datos
// Importamos y ejecutamos el scheduler

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
app.use('/api/v1/stakeholders', stakeholdersRoutes); // <-- AÑADIDO para compatibilidad V1
app.use('/api/v1', stakeholderRoutes);
app.use('/api/v1/lists', listRoutes);
app.use('/api/v1/cards', cardRoutes);
app.use('/api/v1/me', meRoutes);
app.use('/api/v1/labels', labelRoutes);
app.use('/api/documents', documentsRoutes);
// NovaProject v2.0.0 Routes
app.use('/api/milestones', milestonesRoutes);
app.use('/api/stakeholders', stakeholdersRoutes);
app.use('/api/risks', risksRoutes);
app.use('/api/deliverables', deliverablesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/budget', budgetRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is running' });
});


// Definimos el puerto en el que escuchará el servidor
const PORT = process.env.PORT || 3000;

// Iniciamos el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});