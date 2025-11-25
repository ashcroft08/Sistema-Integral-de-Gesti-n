import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:4000/api',
    timeout: 10000,
    withCredentials: true
});

// Interceptor para agregar el token a las requests
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor único para manejar respuestas
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Manejar errores de conexión
        if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
            const connectionError = new Error('El sistema no está disponible en este momento. Por favor, intenta nuevamente en unos minutos.');
            connectionError.name = 'ConnectionError';
            return Promise.reject(connectionError);
        }

        // Manejar errores de autenticación SOLO para rutas no-auth
        if (error.response?.status === 401 || error.response?.status === 403) {
            const currentPath = window.location.pathname;
            const authRoutes = ['/login', '/forgot-password', '/reset-password', '/update-password'];
            const isAuthRoute = authRoutes.some(route => currentPath.includes(route));

            // Solo redirigir si NO estamos en una ruta de autenticación
            if (!isAuthRoute) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }

        // Para todos los demás errores, incluido 401 en login, simplemente rechazar
        return Promise.reject(error);
    }
);

export default axiosInstance;