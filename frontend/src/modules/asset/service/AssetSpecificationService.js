import axiosClient from '~/utils/axiosClient';

const API_URL = '/asset-specifications';

class AssetSpecificationService {
    async getAssetSpecificationByAssetId(assetId) {
        try {
            const res = await axiosClient.get(`${API_URL}/asset/${assetId}`);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi lấy thông số kỹ thuật';
            throw new Error(errorMessage);
        }
    }

    async createAssetSpecification(assetId, request) {
        try {
            const res = await axiosClient.post(`${API_URL}/asset/${assetId}`, request);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi tạo thông số kỹ thuật';
            throw new Error(errorMessage);
        }
    }

    async updateAssetSpecificationByAssetId(assetId, request) {
        try {
            const res = await axiosClient.put(`${API_URL}/asset/${assetId}`, request);
            return res.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi khi cập nhật thông số kỹ thuật';
            throw new Error(errorMessage);
        }
    }

    async deleteAssetSpecificationByAssetId(assetId) {
        try {
            const res = await axiosClient.delete(`${API_URL}/asset/${assetId}`);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi xóa thông số kỹ thuật';
            throw new Error(errorMessage);
        }
    }
}

const assetSpecificationService = new AssetSpecificationService();
export default assetSpecificationService;
