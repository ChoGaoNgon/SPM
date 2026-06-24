import axiosClient from '~/utils/axiosClient';

const API_URL = '/plan-issues';

class ProductPlanIssueService {
    async createIssues(trialPlanId, req) {
        try {
            const res = await axiosClient.post(`${API_URL}?trialPlanId=${trialPlanId}`, req, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi ';
            throw new Error(errorMessage);
        }
    }

    async updateIssue(issueId, req) {
        try {
            const res = await axiosClient.put(`${API_URL}/${issueId}`, req, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi ';
            throw new Error(errorMessage);
        }
    }

    async getAllIssueByMoldTrialId(moldTrialPlanId) {
        try {
            const res = await axiosClient.get(API_URL, {
                params: { planId: moldTrialPlanId },
            });
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi ';
            throw new Error(errorMessage);
        }
    }

    async deleteIssue(issueId) {
        try {
            const res = await axiosClient.delete(`${API_URL}/${issueId}`);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi xóa vấn đề';
            throw new Error(errorMessage);
        }
    }
}

const productPlanIssueService = new ProductPlanIssueService();
export default productPlanIssueService;
