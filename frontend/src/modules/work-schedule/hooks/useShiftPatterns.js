import { useState, useEffect } from 'react';
import { message } from 'antd';
import shiftPatternService from '~/services/shiftPatternService';

export const useShiftPatterns = () => {
    const [shiftPatterns, setShiftPatterns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchShiftPatterns = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await shiftPatternService.getActiveShiftPatterns();
            setShiftPatterns(data || []);
        } catch (err) {
            setError(err.message);
            message.error('Không thể tải danh sách mẫu ca: ' + err.message);
            setShiftPatterns([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShiftPatterns();
    }, []);

    return {
        shiftPatterns,
        loading,
        error,
        refreshShiftPatterns: fetchShiftPatterns,
    };
};
