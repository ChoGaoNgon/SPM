import axiosClient from '~/utils/axiosClient';

const API_URL = '/mp-handovers';

class MpHandoverService {
    async createMp(productId, req) {
        try {
            const res = await axiosClient.post(`${API_URL}?productId=${productId}`, req);

            return res.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định khi tạo mới khuôn';
            throw new Error(errorMessage);
        }
    }

    async updateMp(id, req) {
        try {
            const res = await axiosClient.put(`${API_URL}/${id}`, req);
            return res.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định khi cập nhật mold';
            throw new Error(errorMessage);
        }
    }

    async getMpById(id) {
        try {
            const res = await axiosClient.get(`${API_URL}/${id}`);
            return res.data.data;
        } catch (error) {
            const errorMessage =
                error?.res?.data?.message || error.message || 'Lỗi không xác định khi lấy thông tin mold';
            throw new Error(errorMessage);
        }
    }

    async getAllMpByProductId(productId) {
        try {
            const res = await axiosClient.get(`${API_URL}/by-product?productId=${productId}`);
            return res.data.data;
        } catch (error) {
            const errorMessage =
                error?.res?.data?.message || error.message || 'Lỗi không xác định khi lấy danh sách mold';
            throw new Error(errorMessage);
        }
    }

    async getMpCheckByMpApproved(id) {
        try {
            const res = await axiosClient.get(`${API_URL}/${id}/approve`);
            return res.data.data || [];
        } catch (error) {
            const errorMessage =
                error?.res?.data?.message || error.message || 'Lỗi không xác định khi lấy danh sách mold';
            throw new Error(errorMessage);
        }
    }

    async approveMpCheck(mpCheckId, formdata) {
        try {
            const res = await axiosClient.patch(`${API_URL}/approve/${mpCheckId}`, formdata, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return res.data;
        } catch (error) {
            const errorMessage =
                error?.res?.data?.message || error.message || 'Lỗi không xác định khi lấy danh sách mold';
            throw new Error(errorMessage);
        }
    }

    async getMpTypeCheck() {
        try {
            const res = await axiosClient.get(`${API_URL}/type-checks`);
            return res.data.data;
        } catch (error) {
            const errorMessage =
                error?.res?.data?.message || error.message || 'Lỗi không xác định khi lấy danh sách mold';
            throw new Error(errorMessage);
        }
    }

    async deleteMp(id) {
        try {
            const res = await axiosClient.delete(`${API_URL}/${id}`);
            return res.data;
        } catch (error) {
            const errorMessage = error?.res?.data?.message || error.message || 'Lỗi không xác định khi xóa mold';
            throw new Error(errorMessage);
        }
    }
}

const mpHandoverService = new MpHandoverService();
export default mpHandoverService;
