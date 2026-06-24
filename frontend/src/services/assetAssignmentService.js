import axiosClient from '~/utils/axiosClient';

const API_URL = '/asset-assignments';
class AssetAssignmentService {
    async getAllAssetAssignments() {
        try {
            const res = await axiosClient.get(`${API_URL}`);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi lấy lịch sử cấp phát';
            throw new Error(errorMessage);
        }
    }

    async getAssetAssignmentById(assignmentId) {
        try {
            const res = await axiosClient.get(`${API_URL}/${assignmentId}`);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi lấy lịch sử cấp phát';
            throw new Error(errorMessage);
        }
    }

    async getAssetAssignmentsByAssetId(assetId) {
        try {
            const res = await axiosClient.get(`${API_URL}/asset/${assetId}`);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi lấy lịch sử cấp phát';
            throw new Error(errorMessage);
        }
    }

    async getAssetAssignmentsByEmployeeId(employeeId) {
        try {
            const res = await axiosClient.get(`${API_URL}/employee/${employeeId}`);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi lấy lịch sử cấp phát';
            throw new Error(errorMessage);
        }
    }

    async createAssetAssignment(request) {
        try {
            const res = await axiosClient.post(`${API_URL}`, request);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi tạo lịch sử cấp phát';
            throw new Error(errorMessage);
        }
    }

    async updateAssetAssignment(assignmentId, request) {
        try {
            const res = await axiosClient.put(`${API_URL}/${assignmentId}`, request);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi cập nhật lịch sử cấp phát';
            throw new Error(errorMessage);
        }
    }

    async deleteAssetAssignment(assignmentId) {
        try {
            const res = await axiosClient.delete(`${API_URL}/${assignmentId}`);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi xóa lịch sử cấp phát';
            throw new Error(errorMessage);
        }
    }
}

const assetAssignmentService = new AssetAssignmentService();
export default assetAssignmentService;
