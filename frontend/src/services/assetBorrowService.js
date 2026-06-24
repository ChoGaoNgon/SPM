import axiosClient from '~/utils/axiosClient';

const API_URL = '/asset-borrows';

class AssetBorrowService {
    async createAssetBorrow(assetId, request) {
        try {
            const res = await axiosClient.post(`${API_URL}?assetId=${assetId}`, request);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi tạo đơn mượn tài sản';
            throw new Error(errorMessage);
        }
    }

    async updateAssetBorrow(id, request) {
        try {
            const res = await axiosClient.put(`${API_URL}/${id}`, request);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi cập nhật đơn mượn tài sản';
            throw new Error(errorMessage);
        }
    }

    async getAllAssetBorrows(params = {}) {
        try {
            const res = await axiosClient.get(`${API_URL}`, { params });
            return res.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi khi lấy danh sách đơn mượn tài sản';
            throw new Error(errorMessage);
        }
    }

    async getAssetBorrowById(id) {
        try {
            const res = await axiosClient.get(`${API_URL}/${id}`);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi lấy đơn mượn tài sản';
            throw new Error(errorMessage);
        }
    }

    async getAssetBorrowsByRequestedById(requestedById) {
        try {
            const res = await axiosClient.get(`${API_URL}/requested-by/${requestedById}`);
            return res.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi khi lấy danh sách đơn mượn theo nhân viên';
            throw new Error(errorMessage);
        }
    }

    async getAssetBorrowsByAssetId(assetId) {
        try {
            const res = await axiosClient.get(`${API_URL}/asset/${assetId}`);
            return res.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi khi lấy danh sách đơn mượn theo tài sản';
            throw new Error(errorMessage);
        }
    }

    async approveAssetBorrow(id) {
        try {
            const res = await axiosClient.put(`${API_URL}/${id}/approve`);
            return res.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi khi phê duyệt đơn mượn tài sản';
            throw new Error(errorMessage);
        }
    }

    async rejectAssetBorrow(id, data) {
        try {
            const res = await axiosClient.put(`${API_URL}/${id}/reject`, data);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi từ chối đơn mượn tài sản';
            throw new Error(errorMessage);
        }
    }

    async returnAsset(id) {
        try {
            const res = await axiosClient.put(`${API_URL}/${id}/return`);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi trả tài sản';
            throw new Error(errorMessage);
        }
    }

    async deleteAssetBorrow(id) {
        try {
            const res = await axiosClient.delete(`${API_URL}/${id}`);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi xóa đơn mượn tài sản';
            throw new Error(errorMessage);
        }
    }
}

const assetBorrowService = new AssetBorrowService();
export default assetBorrowService;
