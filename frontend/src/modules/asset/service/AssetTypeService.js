import axiosClient from '~/utils/axiosClient';

const API_URL = '/asset-types';

class AssetTypeService {
    async createAssetType(req) {
        try {
            const res = await axiosClient.post(`${API_URL}`, req);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi tạo mới Asset';
            throw new Error(errorMessage);
        }
    }

    async updateAssetType(id, req) {
        try {
            const res = await axiosClient.put(`${API_URL}/${id}`, req);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data.message || error.message || 'Lỗi khi chỉnh sửa Asset';
            throw new Error(errorMessage);
        }
    }

    async getAssetTypeById(id) {
        try {
            const res = await axiosClient.get(`${API_URL}/${id}`);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data.message || error.message || 'Lỗi khi lấy thông tin Asset';
            throw new Error(errorMessage);
        }
    }

    async getAllAssetTypes() {
        try {
            const res = await axiosClient.get(`${API_URL}`);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data.message || error.message || 'Lỗi khi lấy danh sách Asset';
            throw new Error(errorMessage);
        }
    }
}

const assetTypeService = new AssetTypeService();
export default assetTypeService;
