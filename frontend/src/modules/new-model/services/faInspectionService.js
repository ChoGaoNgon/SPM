import axiosClient from '~/utils/axiosClient';
const API_URL = '/inspection';

class FaInspectionService {
    async receiveFaInspection(planId) {
        try {
            const res = await axiosClient.post(`${API_URL}/plan/${planId}/receive`);
            return res.data;
        } catch (error) {
            const backendMessage = error?.response?.data?.message || error?.message || 'Lỗi nhận mẫu FA';
            throw new Error(backendMessage);
        }
    }
    async updateFaInspection(id, req) {
        try {
            const res = await axiosClient.put(`${API_URL}/${id}`, req, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return res.data;
        } catch (error) {
            const backendMessage = error?.response?.data?.message || error?.message || 'Lỗi cập nhật kiểm tra FA';
            throw new Error(backendMessage);
        }
    }

    async getFaInspectionByMoldTrialPlanId(trialPlanId) {
        try {
            const res = await axiosClient.get(API_URL, {
                params: { trialPlanId },
            });
            return res.data.data;
        } catch (error) {
            throw new Error(error?.message || 'Lỗi tạo sản phẩm');
        }
    }
}

const faInspectionService = new FaInspectionService();
export default faInspectionService;
