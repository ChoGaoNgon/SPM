import axiosClient from "~/utils/axiosClient";

const API_URL = '/shift-breaks';

class ShiftBreakService {
    async getBreakType() {
        try {
            const response = await axiosClient.get(`${API_URL}/break-types`);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }


    async getAllShiftBreaks() {
        try {
            const response = await axiosClient.get(`${API_URL}`);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async getShiftBreaksByShiftId(shiftId) {
        try {
            const response = await axiosClient.get(`${API_URL}/by-shift/${shiftId}`);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || "Lỗi không xác định";
            throw new Error(errorMessage);
        }
    }

    async getShiftBreakById(shiftBreakId) {
        try {
            const response = await axiosClient.get(`${API_URL}/${shiftBreakId}`);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async addShiftBreak(data) {
        try {
            const response = await axiosClient.post(`${API_URL}`, data);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || "Lỗi không xác định";
            throw new Error(errorMessage);
        }
    }

    async updateShiftBreak(shiftBreakId, data) {
        try {
            const response = await axiosClient.patch(`${API_URL}/${shiftBreakId}`, data);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || "Lỗi không xác định";
            throw new Error(errorMessage);
        }
    }

    async deleteShiftBreak(shiftBreakId) {
        try {
            const response = await axiosClient.delete(`${API_URL}/${shiftBreakId}`);
            return response.data.message;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || "Lỗi không xác định";
            throw new Error(errorMessage);
        }
    }
}

const shiftBreakService = new ShiftBreakService();

export default shiftBreakService;