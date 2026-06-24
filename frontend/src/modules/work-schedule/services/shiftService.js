import axiosClient from "~/utils/axiosClient";

const API_URL = '/shifts';

class ShiftService {
    async getAllShifts() {
        try {
            const response = await axiosClient.get(`${API_URL}`);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async getShiftById(shiftId) {
        try {
            const response = await axiosClient.get(`${API_URL}/${shiftId}`);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async addShift(data) {
        try {
            const response = await axiosClient.post(`${API_URL}`, data);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || "Lỗi không xác định";
            throw new Error(errorMessage);
        }
    }

    async updateShift(shiftId, data) {
        try {
            const response = await axiosClient.patch(`${API_URL}/${shiftId}`, data);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || "Lỗi không xác định";
            throw new Error(errorMessage);
        }
    }

    async deleteShifts(shiftId) {
        try {
            const response = await axiosClient.delete(`${API_URL}/${shiftId}`);
            return response.data.message;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || "Lỗi không xác định";
            throw new Error(errorMessage);
        }
    }

}

const shiftService = new ShiftService();

export default shiftService;