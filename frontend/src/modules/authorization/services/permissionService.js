import axiosClient from '~/utils/axiosClient';

const API_URL = '/permissions';

class PermissionService {
    async getAllPermissions() {
        try {
            const response = await axiosClient.get(`${API_URL}`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi lấy danh sách quyền';
            throw new Error(errorMessage);
        }
    }

    async getPermissionsByRole(role) {
        try {
            const response = await axiosClient.get(`${API_URL}/role/${encodeURIComponent(role)}`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi lấy quyền theo role';
            throw new Error(errorMessage);
        }
    }

    async getPermissionsByEmployee(employeeId) {
        try {
            const response = await axiosClient.get(`${API_URL}/employee/${employeeId}`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi lấy quyền theo role';
            throw new Error(errorMessage);
        }
    }

    async getEmployeesByPermission(permissionCode) {
        try {
            const response = await axiosClient.get(`${API_URL}/code/${encodeURIComponent(permissionCode)}/employees`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi lấy nhân viên theo quyền';
            throw new Error(errorMessage);
        }
    }

    async createPermission(code, description) {
        try {
            const response = await axiosClient.post(`${API_URL}/create`, {
                code,
                description,
            });
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi tạo quyền';
            throw new Error(errorMessage);
        }
    }

    async updatePermission(code, description) {
        try {
            const response = await axiosClient.patch(`${API_URL}/${encodeURIComponent(code)}`, {
                description,
            });
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi cập nhật quyền';
            throw new Error(errorMessage);
        }
    }

    async deletePermission(code) {
        try {
            const response = await axiosClient.delete(`${API_URL}/${encodeURIComponent(code)}`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi xóa quyền';
            throw new Error(errorMessage);
        }
    }

    async assignPermissionToRole(role, code) {
        try {
            await axiosClient.post(`${API_URL}/role/${role}/assign`, {
                code,
            });
            return true;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi gán quyền cho role';
            throw new Error(errorMessage);
        }
    }

    async revokePermissionFromRole(role, code) {
        try {
            await axiosClient.post(`${API_URL}/role/${role}/revoke`, {
                code,
            });
            return true;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi thu hồi quyền từ role';
            throw new Error(errorMessage);
        }
    }

    async grantPermissionToEmployee(employeeId, code) {
        try {
            await axiosClient.post(`${API_URL}/employee/${employeeId}/grant`, {
                code,
            });
            return true;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi gán quyền cho nhân viên';
            throw new Error(errorMessage);
        }
    }

    async revokePermissionFromEmployee(employeeId, code) {
        try {
            await axiosClient.post(`${API_URL}/employee/${employeeId}/revoke`, {
                code,
            });
            return true;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi khi thu hồi quyền từ nhân viên';
            throw new Error(errorMessage);
        }
    }
}
const permissionService = new PermissionService();
export default permissionService;
