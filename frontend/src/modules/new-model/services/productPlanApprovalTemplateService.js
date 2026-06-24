import axiosClient from '../../../utils/axiosClient';

const API_URL = '/product-plan-approval-templates';

class ProductPlanApprovalTemplateService {
    async getAllTemplates() {
        try {
            const res = await axiosClient.get(API_URL);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi tải danh sách template';
            throw new Error(errorMessage);
        }
    }

    async getTemplateById(id) {
        try {
            const res = await axiosClient.get(`${API_URL}/${id}`);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi tải template';
            throw new Error(errorMessage);
        }
    }

    async createTemplate(data) {
        try {
            const res = await axiosClient.post(API_URL, data);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi tạo template';
            throw new Error(errorMessage);
        }
    }

    async updateTemplate(id, data) {
        try {
            const res = await axiosClient.put(`${API_URL}/${id}`, data);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi cập nhật template';
            throw new Error(errorMessage);
        }
    }

    async deleteTemplate(id) {
        try {
            const res = await axiosClient.delete(`${API_URL}/${id}`);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi xóa template';
            throw new Error(errorMessage);
        }
    }

    async reorderTemplates(templateIds) {
        try {
            const res = await axiosClient.put(`${API_URL}/reorder`, templateIds);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi sắp xếp template';
            throw new Error(errorMessage);
        }
    }
}

const productPlanApprovalTemplateService = new ProductPlanApprovalTemplateService();
export default productPlanApprovalTemplateService;
