import { useState, useEffect, useCallback } from 'react';
import { discountService } from '../services/discount.service';
import { toast } from 'react-toastify';

export const useDiscounts = () => {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadDiscounts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await discountService.getAll();
            if (response.success) {
                setDiscounts(response.discounts);
            }
        } catch (err) {
            setError(err.message);
            toast.error("Error al cargar los descuentos");
        } finally {
            setLoading(false);
        }
    }, []);

    const createDiscount = async (data) => {
        try {
            const response = await discountService.create(data);
            if (response.success) {
                await loadDiscounts();
                return { success: true };
            }
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const updateDiscount = async (id, data) => {
        try {
            const response = await discountService.update(id, data);
            if (response.success) {
                await loadDiscounts();
                return { success: true };
            }
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    // ✨ Toggle Status
    const toggleDiscountStatus = async (id, currentStatus) => {
        try {
            const response = await discountService.changeStatus(id, !currentStatus);
            if (response.success) {
                await loadDiscounts();
                return { success: true, message: response.message };
            }
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    useEffect(() => {
        loadDiscounts();
    }, [loadDiscounts]);

    return { discounts, loading, error, createDiscount, updateDiscount, toggleDiscountStatus, refresh: loadDiscounts };
};