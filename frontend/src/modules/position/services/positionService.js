import axiosClient from "~/utils/axiosClient";

const API_URL = '/positions';

class PositionService {

    async getAllPositions() {
        try {
            const response = await axiosClient.get(`${API_URL}`);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async getPositionById(positionId) {
        try {
            const response = await axiosClient.get(`${API_URL}/${positionId}`);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async createPosition(data) {
        try {
            const response = await axiosClient.post(`${API_URL}`, data);
            return response.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || "Lỗi không xác định";
            throw new Error(errorMessage);
        }
    }

    async updatePosition(positionId, data) {
        try {
            const response = await axiosClient.put(`${API_URL}/${positionId}`, data);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || "Lỗi không xác định";
            throw new Error(errorMessage);
        }
    }

    async deletePosition(positionId) {
        try {
            const response = await axiosClient.delete(`${API_URL}/${positionId}`);
            return response.data.message;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || "Lỗi không xác định";
            throw new Error(errorMessage);
        }
    }

}

const positionService = new PositionService();
export default positionService;