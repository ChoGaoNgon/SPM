import axiosClient from '~/utils/axiosClient';

const API_URL = '/machine-types';

class MachineTypeService {
    async createMachineType(payload) {
        try {
            const response = await axiosClient.post(API_URL, payload);
            return response.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi tạo loại máy';
            throw new Error(errorMessage);
        }
    }

    async updateMachineType(id, payload) {
        try {
            const response = await axiosClient.put(`${API_URL}/${id}`, payload);
            return response.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi cập nhật loại máy';
            throw new Error(errorMessage);
        }
    }

    async deleteMachineType(id) {
        try {
            await axiosClient.delete(`${API_URL}/${id}`);
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi xóa loại máy';
            throw new Error(errorMessage);
        }
    }

    async getMachineTypeById(id) {
        try {
            const response = await axiosClient.get(`${API_URL}/${id}`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi lấy loại máy';
            throw new Error(errorMessage);
        }
    }

    async getAllMachineTypes() {
        try {
            const response = await axiosClient.get(API_URL);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi lấy danh sách loại máy';
            throw new Error(errorMessage);
        }
    }
}

export default new MachineTypeService();
