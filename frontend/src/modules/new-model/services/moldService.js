import axiosClient from '~/utils/axiosClient';

const API_URL = '/molds';

class MoldService {
    async createMold(moldRequest) {
        try {
            const response = await axiosClient.post(API_URL, moldRequest);
            return response.data.message || 'Tạo mới khuôn thành công';
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định khi tạo mới khuôn';
            throw new Error(errorMessage);
        }
    }

    async updateMold(moldId, moldRequest) {
        try {
            const response = await axiosClient.put(`${API_URL}/${moldId}`, moldRequest);
            return response.data.message || 'Cập nhật khuôn thành công';
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định khi cập nhật mold';
            throw new Error(errorMessage);
        }
    }

    async getMoldById(moldId) {
        try {
            const response = await axiosClient.get(`${API_URL}/${moldId}`);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định khi lấy thông tin mold';
            throw new Error(errorMessage);
        }
    }

    async getAllMolds(keyword) {
        try {
            const response = await axiosClient.get(`${API_URL}/search?keyword=${keyword}`);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định khi lấy danh sách mold';
            throw new Error(errorMessage);
        }
    }

    async deleteMold(moldId) {
        try {
            const response = await axiosClient.delete(`${API_URL}/${moldId}`);
            return response.data.message || 'Xóa khuôn thành công';
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi không xác định khi xóa mold';
            throw new Error(errorMessage);
        }
    }

    async search(keyword) {
        try {
            const response = await axiosClient.get(`${API_URL}/search`, {
                params: { keyword },
            });
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi khi tìm kiếm theo mã sản phẩm hoặc khuôn';
            throw new Error(errorMessage);
        }
    }
}

const moldService = new MoldService();
export default moldService;
