// src/hooks/useAuthForm.js
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export const useAuthForm = (schema, defaultValues = {}) => {
    return useForm({
        resolver: zodResolver(schema),
        mode: 'onChange',
        defaultValues
    });
};

// Hook específico para login
export const useLoginForm = () => {
    return useAuthForm(LoginSchema, {
        email: '',
        password: ''
    });
};