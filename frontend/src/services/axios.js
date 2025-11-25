import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:4000/api',
    timeout: 10000,
    withCredentials: true
});

// Solo interceptor de request para token
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

// NO agregues interceptor de response aquí
// El manejo de errores se hará en los componentes

export default axiosInstance;