import axiosClient from '~/utils/axiosClient';

const API_URL = '/notification/templates';

class NotificationTemplateService {
    async getAllTemplates() {
        try {
            const response = await axiosClient.get(API_URL);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi không xác định khi lấy danh sách mẫu thông báo';
            throw new Error(errorMessage);
        }
    }

    async getTemplateById(id) {
        try {
            const response = await axiosClient.get(`${API_URL}/${id}`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi không xác định khi lấy mẫu thông báo';
            throw new Error(errorMessage);
        }
    }

    async createTemplate(templateData) {
        try {
            const response = await axiosClient.post(API_URL, templateData);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi không xác định khi tạo mẫu thông báo';
            throw new Error(errorMessage);
        }
    }

    async updateTemplate(id, templateData) {
        try {
            const response = await axiosClient.put(`${API_URL}/${id}`, templateData);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi không xác định khi cập nhật mẫu thông báo';
            throw new Error(errorMessage);
        }
    }

    async deleteTemplate(id) {
        try {
            const response = await axiosClient.delete(`${API_URL}/${id}`);
            return response.data.message || 'Xóa mẫu thông báo thành công';
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi không xác định khi xóa mẫu thông báo';
            throw new Error(errorMessage);
        }
    }
}

const notificationTemplateService = new NotificationTemplateService();
export default notificationTemplateService;
