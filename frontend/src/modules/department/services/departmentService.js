import axiosClient from "~/utils/axiosClient";

const API_URL = '/departments';

class DepartmentService {
    async getDepartmentById(departmentId) {
        try {
            const response = await axiosClient.get(`${API_URL}/${departmentId}`);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async getRootDepartments() {
        try {
            const response = await axiosClient.get(`${API_URL}/root`);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async getSubDepartments(departmentId) {
        try {
            const response = await axiosClient.get(`${API_URL}/${departmentId}/sub`);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async createDepartment(data) {
        try {
            const response = await axiosClient.post(`${API_URL}`, data);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || "Lỗi không xác định";
            throw new Error(errorMessage);
        }
    }

    async updateDepartment(departmentId, data) {
        try {
            const response = await axiosClient.patch(`${API_URL}/${departmentId}`, data);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || "Lỗi không xác định";
            throw new Error(errorMessage);
        }
    }

    async deleteDepartment(departmentId) {
        try {
            const response = await axiosClient.delete(`${API_URL}/${departmentId}`);
            return response.data.message;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || "Lỗi không xác định";
            throw new Error(errorMessage);
        }
    }

}

const departmentService = new DepartmentService();
export default departmentService;