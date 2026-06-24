import axiosClient from '~/utils/axiosClient';

const API_URL = '/employees';
class EmployeeService {
    async getAllEmployees() {
        try {
            const res = await axiosClient.get(API_URL);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async createEmployee(data) {
        try {
            const response = await axiosClient.post(`${API_URL}`, data);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async getEmployeeById(employeeId) {
        try {
            const response = await axiosClient.get(`${API_URL}/${employeeId}`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async getEmployeeByCode(code) {
        try {
            const response = await axiosClient.get(`${API_URL}/code`, { params: { code } });
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async getEmployeesByDepartment(departmentId, departmentCode) {
        try {
            const params = {};
            if (departmentId) params.departmentId = departmentId;
            if (departmentCode) params.departmentCode = departmentCode;

            const response = await axiosClient.get(`${API_URL}/department`, { params });
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async updateEmployee(employeeId, data) {
        try {
            const response = await axiosClient.patch(`${API_URL}/${employeeId}`, data);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async updateEmployeeRole(employeeId, role) {
        try {
            const response = await axiosClient.patch(`${API_URL}/${employeeId}/role`, { role });
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async resetEmployeePassword(employeeId) {
        try {
            const response = await axiosClient.post(`${API_URL}/${employeeId}/reset-password`);
            return response.data.message;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Không thể reset mật khẩu nhân viên';
            throw new Error(errorMessage);
        }
    }

    async deleteEmployee(employeeId) {
        try {
            const response = await axiosClient.delete(`${API_URL}/${employeeId}`);
            return response.data.message;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async getAllEmployeeRolees() {
        try {
            const response = await axiosClient.get(`${API_URL}/status`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async syncEmployeeData() {
        try {
            const response = await axiosClient.post(`${API_URL}/sync`);
            return response.data.message;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }
    async getEmployeeStats() {
        try {
            const response = await axiosClient.get(`${API_URL}/stats`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async searchEmployees(searchRequest) {
        try {
            const response = await axiosClient.post(`${API_URL}/search`, searchRequest);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async searchEmployeesWithPagination(searchRequest, page = 0, size = 10, sortBy = 'id', sortDirection = 'ASC') {
        try {
            const response = await axiosClient.post(`${API_URL}/search/page`, searchRequest, {
                params: {
                    page,
                    size,
                    sortBy,
                    sortDirection,
                },
            });
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }
}

const employeeService = new EmployeeService();
export default employeeService;
