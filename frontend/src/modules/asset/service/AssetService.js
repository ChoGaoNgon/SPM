import axiosClient from '~/utils/axiosClient';

const API_URL = '/assets';

class AssetService {
    async createAsset(req) {
        try {
            const res = await axiosClient.post(`${API_URL}`, req);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi tạo tài sản';
            throw new Error(errorMessage);
        }
    }

    async updateAsset(id, req) {
        try {
            const res = await axiosClient.put(`${API_URL}/${id}`, req);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi cập nhật tài sản';
            throw new Error(errorMessage);
        }
    }

    async deleteAsset(id) {
        try {
            const res = await axiosClient.delete(`${API_URL}/${id}`);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi xóa tài sản';
            throw new Error(errorMessage);
        }
    }

    async getAssetById(id) {
        try {
            const res = await axiosClient.get(`${API_URL}/${id}`);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi lấy chi tiết tài sản';
            throw new Error(errorMessage);
        }
    }

    async getAssetByIdWithSpecification(id) {
        try {
            const res = await axiosClient.get(`${API_URL}/${id}/with-specification`);
            return res.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi khi lấy tài sản với thông số kỹ thuật';
            throw new Error(errorMessage);
        }
    }

    async getAllAssets(params = {}) {
        try {
            const queryParams = new URLSearchParams();

            if (params.page !== undefined) {
                queryParams.append('page', params.page);
            }
            if (params.size !== undefined) {
                queryParams.append('size', params.size);
            }

            if (params.keyword) {
                queryParams.append('keyword', params.keyword);
            }
            if (params.assetTypeId) {
                queryParams.append('assetTypeId', params.assetTypeId);
            }
            if (params.employeeUseId) {
                queryParams.append('employeeUseId', params.employeeUseId);
            }
            if (params.departmentId) {
                queryParams.append('departmentId', params.departmentId);
            }
            if (params.status) {
                queryParams.append('status', params.status);
            }
            if (params.startDate) {
                queryParams.append('startDate', params.startDate);
            }
            if (params.isAvailable) {
                queryParams.append('isAvailable', params.isAvailable);
            }

            const url = queryParams.toString() ? `${API_URL}?${queryParams.toString()}` : API_URL;
            const res = await axiosClient.get(url);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi lấy danh sách tài sản';
            throw new Error(errorMessage);
        }
    }

    async getAssetsByDepartmentId(departmentId) {
        try {
            const res = await axiosClient.get(`${API_URL}/department/${departmentId}`);
            return res.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi khi lấy danh sách tài sản theo phòng ban';
            throw new Error(errorMessage);
        }
    }

    async getAssetsByAssetTypeId(assetTypeId) {
        try {
            const res = await axiosClient.get(`${API_URL}/asset-type/${assetTypeId}`);
            return res.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi khi lấy danh sách tài sản theo loại';
            throw new Error(errorMessage);
        }
    }
}

const assetService = new AssetService();
export default assetService;
