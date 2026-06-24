import axiosClient from '~/utils/axiosClient';

const API_URL = '/supplies-htmp';

class ProductResinMappingService {
    async getAllProductResinMapping(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (params.keyword) queryParams.append('keyword', params.keyword);
            const url = queryParams.toString() ? `${API_URL}/resins?${queryParams.toString()}` : `${API_URL}/resins`;
            const res = await axiosClient.get(url);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi lấy danh sách Resin HTMP';
            throw new Error(errorMessage);
        }
    }

    async getAllSupplies(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (params.keyword) queryParams.append('keyword', params.keyword);
            const url = queryParams.toString()
                ? `${API_URL}/supplies?${queryParams.toString()}`
                : `${API_URL}/supplies`;
            const res = await axiosClient.get(url);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi lấy danh sách vật tư HTMP';
            throw new Error(errorMessage);
        }
    }
}

const productResinMappingService = new ProductResinMappingService();
export default productResinMappingService;
