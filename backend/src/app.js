import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import configRoutes from './routes/config.routes.js';
import userRoutes from './routes/user.routes.js'
import categoryRoutes from './routes/category.routes.js'
import roleRoutes from './routes/role.routes.js';
import userSettingsRoutes from './routes/userSettings.routes.js';
import productRoutes from './routes/product.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import salesRoutes from './routes/sales.routes.js';
import clientRoutes from './routes/client.routes.js';
import ivaRoutes from './routes/iva.routes.js';
import discountRoutes from './routes/discount.routes.js';
import locationRoutes from './routes/location.routes.js';
import certicateRoutes from './routes/certificate.routes.js';

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
app.use('/api/products', productRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/taxes', ivaRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/certificates', certicateRoutes);

export default app;