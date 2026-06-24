import axiosClient from '~/utils/axiosClient';

const API_URL = '/menus';

class MenuService {
    async getMenuForCurrentUser() {
        try {
            const response = await axiosClient.get(API_URL);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi tải menu';
            throw new Error(errorMessage);
        }
    }

    async getAllMenuItems() {
        try {
            const response = await axiosClient.get(`${API_URL}/all`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi tải menu';
            throw new Error(errorMessage);
        }
    }

    async getMenuBySystemType(systemType) {
        try {
            const response = await axiosClient.get(`${API_URL}/system/${systemType}`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi tải menu';
            throw new Error(errorMessage);
        }
    }

    async createMenuItem(menuItem) {
        try {
            const response = await axiosClient.post(API_URL, menuItem);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi tạo menu';
            throw new Error(errorMessage);
        }
    }

    async updateMenuItem(id, menuItem) {
        try {
            const response = await axiosClient.put(`${API_URL}/${id}`, menuItem);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi cập nhật menu';
            throw new Error(errorMessage);
        }
    }

    async deleteMenuItem(id) {
        try {
            const response = await axiosClient.delete(`${API_URL}/${id}`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi xóa menu';
            throw new Error(errorMessage);
        }
    }

    async getAllGroupMenus() {
        try {
            const response = await axiosClient.get(`${API_URL}/groups`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi tải danh sách nhóm menu';
            throw new Error(errorMessage);
        }
    }
}

const menuService = new MenuService();
export default menuService;
