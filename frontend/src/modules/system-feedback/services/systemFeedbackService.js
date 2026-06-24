import axiosClient from '~/utils/axiosClient';

const API_URL = '/system-feedbacks';

class SystemFeedbackService {
    buildListParams(keyword, employeeCode = null, statuses = []) {
        const params = {};

        if (keyword && keyword.trim()) {
            params.keyword = keyword.trim();
        }

        if (employeeCode) {
            params.employeeCode = employeeCode;
        }

        if (statuses?.length) {
            params.statuses = statuses;
        }

        return params;
    }

    async createSystemFeedback(req) {
        try {
            const res = await axiosClient.post(API_URL, req);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message;
            throw new Error(errorMessage);
        }
    }

    async updateSystemFeedback(id, req) {
        try {
            const res = await axiosClient.put(`${API_URL}/${id}`, req);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message;
            throw new Error(errorMessage);
        }
    }

    async getAllSystemFeedback(employeeCode = null, statuses = []) {
        try {
            const res = await axiosClient.get(API_URL, {
                params: this.buildListParams('', employeeCode, statuses),
            });
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message;
            throw new Error(errorMessage);
        }
    }

    async searchSystemFeedbacks(keyword, employeeCode = null, statuses = []) {
        try {
            const res = await axiosClient.get(`${API_URL}/search`, {
                params: this.buildListParams(keyword, employeeCode, statuses),
            });
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message;
            throw new Error(errorMessage);
        }
    }

    async getSystemFeedbackById(id) {
        try {
            const res = await axiosClient.get(`${API_URL}/${id}`);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message;
            throw new Error(errorMessage);
        }
    }

    async assignSystemFeedback(id, payload) {
        try {
            const res = await axiosClient.patch(`${API_URL}/${id}/assign`, payload);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message;
            throw new Error(errorMessage);
        }
    }

    async deleteSystemFeedback(id) {
        try {
            const res = await axiosClient.delete(`${API_URL}/${id}`);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message;
            throw new Error(errorMessage);
        }
    }
}

const systemFeedbackService = new SystemFeedbackService();
export default systemFeedbackService;
