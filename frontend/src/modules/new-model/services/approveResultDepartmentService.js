import axiosClient from '~/utils/axiosClient';

const API_URL = '/mold-trial-plan-approve-result-departments';

class ApproveResultDepartmentService {
    async createApproveResultDepartment(request) {
        try {
            const response = await axiosClient.post(API_URL, request);
            return response.data.message || 'Thêm mới phòng ban phê duyệt thành công';
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error.message ||
                'Lỗi không xác định khi thêm mới phòng ban phê duyệt';
            throw new Error(errorMessage);
        }
    }

    async updateApproveResultDepartment(id, request) {
        try {
            const response = await axiosClient.put(`${API_URL}/${id}`, request);
            return response.data.message || 'Cập nhật phòng ban phê duyệt thành công';
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error.message ||
                'Lỗi không xác định khi cập nhật phòng ban phê duyệt';
            throw new Error(errorMessage);
        }
    }

    async getApproveResultDepartmentById(id) {
        try {
            const response = await axiosClient.get(`${API_URL}/${id}`);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error.message ||
                'Lỗi không xác định khi lấy thông tin phòng ban phê duyệt';
            throw new Error(errorMessage);
        }
    }

    async getAllApproveResultDepartments() {
        try {
            const response = await axiosClient.get(API_URL);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error.message ||
                'Lỗi không xác định khi lấy danh sách phòng ban phê duyệt';
            throw new Error(errorMessage);
        }
    }

    async deleteApproveResultDepartment(id) {
        try {
            const response = await axiosClient.delete(`${API_URL}/${id}`);
            return response.data.message || 'Xóa phòng ban phê duyệt thành công';
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định khi xóa phòng ban phê duyệt';
            throw new Error(errorMessage);
        }
    }

    async createTemplateApproveResultDepartments() {
        try {
            const response = await axiosClient.post(`${API_URL}/create-template`);
            return response.data.message || 'Tạo template phòng ban phê duyệt thành công';
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error.message ||
                'Lỗi không xác định khi tạo template phòng ban phê duyệt';
            throw new Error(errorMessage);
        }
    }
}

const approveResultDepartmentService = new ApproveResultDepartmentService();
export default approveResultDepartmentService;
