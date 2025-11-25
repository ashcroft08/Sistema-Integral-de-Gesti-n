import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import configRoutes from './routes/config.routes.js';
import userRoutes from './routes/user.routes.js'
import categoryRoutes from './routes/category.routes.js'
import roleRoutes from './routes/role.routes.js';
import userSettingsRoutes from './routes/userSettings.routes.js';
import productRoutes from './routes/product.routes.js'

const app = express();

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL, // URL del frontend
    credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));

// --- Rutas ---
// Monta el router de autenticación bajo el prefijo /api/auth
app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/users', userRoutes);
app.use('/api/category-product', categoryRoutes);
app.use('/api/roles', roleRoutes); 
app.use('/api/user-settings', userSettingsRoutes);
app.use('/api/products', productRoutes)

export default app;