import axiosClient from '~/utils/axiosClient';

const API_URL = '/newmodel-statistics';

class NMDStatisticsService {
    async getOverviewStatistics() {
        try {
            const res = await axiosClient.get(`${API_URL}/overview-pie-chart`);
            return res.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data.message || error.message || 'Lỗi khi lấy thông tin thống kê tổng quan';
            throw new Error(errorMessage);
        }
    }

    async getProductsByPlanType(planType) {
        try {
            const res = await axiosClient.get(`${API_URL}/products-by-plan-type`, {
                params: { planType },
            });
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data.message || error.message || 'Lỗi khi lấy danh sách sản phẩm';
            throw new Error(errorMessage);
        }
    }

    async getCustomerPlanStatistics(limit = 10, productStatusGroups = []) {
        try {
            const res = await axiosClient.get(`${API_URL}/customer-plan-statistics`, {
                params: {
                    limit,
                    ...(Array.isArray(productStatusGroups) && productStatusGroups.length
                        ? { productStatusGroups }
                        : {}),
                },
            });

            return res.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data.message || error.message || 'Lỗi khi lấy thống kê kế hoạch theo khách hàng';
            throw new Error(errorMessage);
        }
    }

    async getEventStatusStatistics(planType = 'EVENT') {
        try {
            const res = await axiosClient.get(`${API_URL}/event-status-statistics`, {
                params: { planType: String(planType).toUpperCase() },
            });
            return res.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data.message || error.message || 'Lỗi khi lấy thống kê event theo trạng thái';
            throw new Error(errorMessage);
        }
    }

    async getProductsPendingApproval() {
        try {
            const res = await axiosClient.get(`${API_URL}/products-pending-approval`);
            return res.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data.message || error.message || 'Lỗi khi lấy danh sách sản phẩm đang chờ phê duyệt';
            throw new Error(errorMessage);
        }
    }
    async getPlansPendingApproval() {
        try {
            const res = await axiosClient.get(`${API_URL}/plan-pending-approval`);
            return res.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data.message || error.message || 'Lỗi khi lấy danh sách kế hoạch đang chờ phê duyệt';
            throw new Error(errorMessage);
        }
    }

    async getProductPlansWithNullActualFaSubmitDate() {
        try {
            const res = await axiosClient.get(`${API_URL}/plans-with-null-actual-fa-submit-date`);
            return res.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data.message ||
                error.message ||
                'Lỗi khi lấy danh sách kế hoạch có ngày gửi FA thực tế null';
            throw new Error(errorMessage);
        }
    }
}

const nmdStatisticsService = new NMDStatisticsService();
export default nmdStatisticsService;
