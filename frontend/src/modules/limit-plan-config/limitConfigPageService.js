import axiosClient from '~/utils/axiosClient';

const API_URL = '/product-plan-limit-configs';

const LimitPlanConfigService = {
    async createLimitPlanConfigByAllDepartment() {
        try {
            const res = await axiosClient.post(API_URL);
            return res.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi khi tạo mới giới hạn theo các phòng ban';
            throw new Error(errorMessage);
        }
    },
    async updateLimitPlanConfig(id, req) {
        try {
            const res = await axiosClient.put(`${API_URL}/${id}`, req);
            return res.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi khi cập nhật giới hạn theo các phòng ban';
            throw new Error(errorMessage);
        }
    },
    async getLimitPlanConfigById(id) {
        try {
            const res = await axiosClient.get(`${API_URL}/${id}`);
            return res.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi khi lấy thông tin giới hạn theo các phòng ban';
            throw new Error(errorMessage);
        }
    },
    async getAllLimitPlanConfigs() {
        try {
            const res = await axiosClient.get(API_URL);
            return res.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi khi lấy danh sách giới hạn theo các phòng ban';
            throw new Error(errorMessage);
        }
    },
};

const limitPlanConfigService = LimitPlanConfigService;
export default limitPlanConfigService;
