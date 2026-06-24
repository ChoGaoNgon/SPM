import axiosClient from "~/utils/axiosClient";

const API_URL = '/roles';

class RoleService {

    async getAllRoles() {
        try {
            const response = await axiosClient.get(`${API_URL}`);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }
}

const roleService = new RoleService();
export default roleService;