import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes.js';
import configRoutes from './routes/config.routes.js';
import userRoutes from './routes/user.routes.js';
import roleRoutes from './routes/role.routes.js';
import userSettingsRoutes from './routes/userSettings.routes.js';

import { errorHandler } from './middleware/error.middleware.js';

const app = express();

// 1. Cabeceras de seguridad con Helmet
app.use(helmet());

// 2. Compresión de respuestas HTTP
app.use(compression());

// 3. Configuración de CORS
app.use(cors({
    origin: process.env.FRONTEND_URL, // URL del frontend
    credentials: true
}));

// 4. Rate Limiting (Protección contra DDoS y abusos)
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 200, // Límite de 200 peticiones por IP en esta ventana
    message: {
        success: false,
        error: 'Demasiadas peticiones desde esta dirección IP. Por favor, intente más tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 30, // 30 intentos por IP para evitar fuerza bruta en desarrollo y pruebas de integración
    message: {
        success: false,
        error: 'Demasiados intentos de acceso. Por favor, intente de nuevo en 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Aplicar limitador global a todas las rutas de la API
app.use('/api', globalLimiter);

app.use(express.json());
app.use(morgan('dev'));

// --- Rutas ---
// Monta el router de autenticación bajo el prefijo /api/auth con limitador específico
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes); 
app.use('/api/user-settings', userSettingsRoutes);

// --- Middleware Global de Errores ---
app.use(errorHandler);

export default app;