import axiosClient from '~/utils/axiosClient';

const API_URL = '/shift-patterns';

class ShiftPatternService {
    async getAllShiftPatterns() {
        try {
            const response = await axiosClient.get(API_URL);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi tải danh sách mẫu ca';
            throw new Error(errorMessage);
        }
    }

    async getActiveShiftPatterns() {
        try {
            const response = await axiosClient.get(`${API_URL}/active`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi tải danh sách mẫu ca';
            throw new Error(errorMessage);
        }
    }

    async getShiftPatternById(id) {
        try {
            const response = await axiosClient.get(`${API_URL}/${id}`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi tải thông tin mẫu ca';
            throw new Error(errorMessage);
        }
    }

    async getShiftPatternByCode(code) {
        try {
            const response = await axiosClient.get(`${API_URL}/code/${code}`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi tải thông tin mẫu ca';
            throw new Error(errorMessage);
        }
    }

    async createShiftPattern(shiftPattern) {
        try {
            const response = await axiosClient.post(API_URL, shiftPattern);
            return response.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi tạo mẫu ca';
            throw new Error(errorMessage);
        }
    }

    async updateShiftPattern(id, shiftPattern) {
        try {
            const response = await axiosClient.put(`${API_URL}/${id}`, shiftPattern);
            return response.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi cập nhật mẫu ca';
            throw new Error(errorMessage);
        }
    }

    async deleteShiftPattern(id) {
        try {
            const response = await axiosClient.delete(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi xóa mẫu ca';
            throw new Error(errorMessage);
        }
    }

    async toggleActiveStatus(id) {
        try {
            const response = await axiosClient.put(`${API_URL}/${id}/toggle-active`);
            return response.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi thay đổi trạng thái';
            throw new Error(errorMessage);
        }
    }
}

export default new ShiftPatternService();
