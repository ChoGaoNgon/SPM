import axiosClient from '~/utils/axiosClient';

const API_URL = '/product-plan-delay-logs';

class ProductPlanDelayLogService {
    async getDelayLogsByPlanId(planId) {
        try {
            const res = await axiosClient.get(`${API_URL}/delay-logs/${planId}`);
            return res?.data?.data || [];
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi tải log trễ kế hoạch';
            throw new Error(errorMessage);
        }
    }
}

const productPlanDelayLogService = new ProductPlanDelayLogService();
export default productPlanDelayLogService;
