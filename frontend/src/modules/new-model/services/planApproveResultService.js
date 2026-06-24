import axiosClient from '~/utils/axiosClient';

const API_URL = '/products/plans';

class PlanApproveResultService {
    async getApproveResultsByMoldTrialPlanId(moldTrialPlanId) {
        try {
            const response = await axiosClient.get(`${API_URL}/${moldTrialPlanId}/approve-results`);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi khi lấy danh sách kết quả phê duyệt';
            throw new Error(errorMessage);
        }
    }

    async updateApproveResult(moldTrialPlanId, departmentCode, request) {
        try {
            const response = await axiosClient.put(
                `${API_URL}/${moldTrialPlanId}/approve-results/${departmentCode}`,
                request,
            );
            return response.data.message || 'Cập nhật kết quả phê duyệt thành công';
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi khi cập nhật kết quả phê duyệt';
            throw new Error(errorMessage);
        }
    }

    async batchUpdateApproveResults(moldTrialPlanId, results) {
        try {
            const response = await axiosClient.put(`${API_URL}/${moldTrialPlanId}/approve-results/batch`, {
                approveResults: results,
            });
            return response.data.message || 'Cập nhật kết quả phê duyệt thành công';
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi khi cập nhật kết quả phê duyệt hàng loạt';
            throw new Error(errorMessage);
        }
    }
}

const planApproveResultService = new PlanApproveResultService();
export default planApproveResultService;
