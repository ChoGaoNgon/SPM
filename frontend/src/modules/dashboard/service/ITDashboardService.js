import axiosClient from '~/utils/axiosClient';

const API_URL = '/system-feedbacks';

class ITDashboardService {
    async getSystemFeedbackDashboard() {
        try {
            const res = await axiosClient.get(`${API_URL}/dashboard-it`);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi lấy dữ liệu dashboard IT';
            throw new Error(errorMessage);
        }
    }
}

const itDashboardService = new ITDashboardService();
export default itDashboardService;
