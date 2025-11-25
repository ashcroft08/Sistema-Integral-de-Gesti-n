import axiosInstance from './axios';

// Crear instancia específica para autenticación
const auth = axiosInstance;

// Interceptor para añadir el token a todas las peticiones
auth.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && !config.headers['Authorization']) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de autenticación
auth.interceptors.response.use(
    (response) => response,
    (error) => {
        // Manejar errores de autenticación
        if (error.response?.status === 401 || error.response?.status === 403) {
            const currentPath = window.location.pathname;
            const authRoutes = ['/login', '/forgot-password', '/reset-password'];
            const isAuthRoute = authRoutes.some(route => currentPath.includes(route));

            if (!isAuthRoute) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                delete auth.defaults.headers.common['Authorization'];

                // Redirigir solo si no estamos ya en una ruta de auth
                if (!isAuthRoute) {
                    window.location.href = '/login';
                }
            }
        }

        // Para otros errores, mantener el comportamiento original
        return Promise.reject(error);
    }
);

export default auth;