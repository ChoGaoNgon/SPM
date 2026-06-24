import axiosClient from '~/utils/axiosClient';

const API_URL = '/product-delivery';

class ProductDeliveryService {
    async createFaDelivery(faInspectionId, req) {
        try {
            const res = await axiosClient.post(`${API_URL}?faInspectionId=${faInspectionId}`, req);
            return res.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi khi tạo mới thông tin giao hàng FA';
            throw new Error(errorMessage);
        }
    }
    async updateFaDelivery(id, req) {
        try {
            const res = await axiosClient.put(`${API_URL}/${id}`, req);
            return res.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi khi chỉnh sửa thông tin giao hàng FA';
            throw new Error(errorMessage);
        }
    }

    async getFaDeliveryByMoldTrialPlanId(moldTrialPlanId) {
        try {
            const res = await axiosClient.get(API_URL, {
                params: { moldTrialPlanId },
            });
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi ';
            throw new Error(errorMessage);
        }
    }

    async approveConditionFile(id, req) {
        try {
            const res = await axiosClient.patch(`${API_URL}/${id}/approve-condition-file`, req);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi duyệt file điều kiện đúc';
            throw new Error(errorMessage);
        }
    }
}

const productDeliveryService = new ProductDeliveryService();
export default productDeliveryService;
