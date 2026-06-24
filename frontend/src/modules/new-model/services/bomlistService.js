import axiosClient from '~/utils/axiosClient';

const API_URL = '/bomlists';

class BomlistService {
    async createBomList(modelId, req) {
        try {
            const res = await axiosClient.post(`${API_URL}?modelId=${modelId}`, req);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi tạo mới Bomlist';
            throw new Error(errorMessage);
        }
    }

    async updateBomlist(id, req) {
        try {
            const res = await axiosClient.put(`${API_URL}/${id}`, req);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data.message || error.message || 'Lỗi khi chỉnh sửa Bomlist';
            throw new Error(errorMessage);
        }
    }

    async approveBomlist(id, req) {
        try {
            const res = await axiosClient.patch(`${API_URL}/${id}/approve`, req);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data.message || error.message || 'Lỗi khi chỉnh sửa Bomlist';
            throw new Error(errorMessage);
        }
    }

    async getBomlistById(id) {
        try {
            const res = await axiosClient.get(`${API_URL}/${id}`);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data.message || error.message || 'Lỗi khi lấy thông tin Bomlist';
            throw new Error(errorMessage);
        }
    }

    async getAllBomlistByModel(modelId) {
        try {
            const res = await axiosClient.get(`${API_URL}/by-models?modelId=${modelId}`);
            return res.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data.message || error.message || 'Lỗi khi lấy thông tin Bomlist theo model';
            throw new Error(errorMessage);
        }
    }

    async deleteBomlist(id) {
        try {
            const res = await axiosClient.delete(`${API_URL}/${id}`);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi xóa Bomlist';
            throw new Error(errorMessage);
        }
    }
}

const bomlistService = new BomlistService();
export default bomlistService;
