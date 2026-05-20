import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
    timeout: 10000,
    withCredentials: true,
});

// Interceptor de solicitud: añadir token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de respuesta: manejo global de errores
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Errores de red (Servidor caído o sin internet)
        if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
            const connectionError = new Error('El sistema no está disponible. Intenta más tarde.');
            connectionError.name = 'ConnectionError';
            return Promise.reject(connectionError);
        }

        // 🔑 SOLO cerrar sesión en 401 (token inválido/expirado)
        if (error.response?.status === 401) {
            const currentPath = window.location.pathname;
            // Lista de rutas donde NO queremos que un 401 nos saque (ej: intentando loguearse)
            const authRoutes = ['/login', '/forgot-password', '/reset-password', '/update-password'];

            // Verificamos si la ruta actual empieza con alguna de las rutas de auth
            const isAuthRoute = authRoutes.some(route => currentPath.startsWith(route));

            if (!isAuthRoute) {
                // Limpieza completa
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                // Usar window.location.replace para forzar la recarga y limpiar estado de memoria
                // Esto evita bucles infinitos en React Router
                window.location.replace('/login');
                return Promise.reject(new Error('Sesión expirada'));
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;