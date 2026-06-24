import axiosClient from '~/utils/axiosClient';

const API_URL = '/notification/rules';

class NotificationRuleService {
    async getAllRules() {
        try {
            const response = await axiosClient.get(API_URL);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi không xác định khi lấy danh sách quy tắc';
            throw new Error(errorMessage);
        }
    }

    async getRuleById(id) {
        try {
            const response = await axiosClient.get(`${API_URL}/${id}`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi không xác định khi lấy quy tắc';
            throw new Error(errorMessage);
        }
    }

    async createRule(ruleData) {
        try {
            const response = await axiosClient.post(API_URL, ruleData);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi không xác định khi tạo quy tắc';
            throw new Error(errorMessage);
        }
    }

    async updateRule(id, ruleData) {
        try {
            const response = await axiosClient.put(`${API_URL}/${id}`, ruleData);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi không xác định khi cập nhật quy tắc';
            throw new Error(errorMessage);
        }
    }

    async deleteRule(id) {
        try {
            const response = await axiosClient.delete(`${API_URL}/${id}`);
            return response.data.message || 'Xóa quy tắc thành công';
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi không xác định khi xóa quy tắc';
            throw new Error(errorMessage);
        }
    }
}

const notificationRuleService = new NotificationRuleService();
export default notificationRuleService;
