import axiosClient from '~/utils/axiosClient';

const API_URL = '/machines';

class MachineService {
    async getDistinctMachineDetailFieldValues(field) {
        try {
            const response = await axiosClient.get(`${API_URL}/distinct`, {
                params: { field },
            });
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async getAllMachines(params = {}) {
        try {
            const { sortBy, sortDir, sort, ...restParams } = params;
            const normalizedSort = sort || (sortBy ? `${sortBy},${(sortDir || 'desc').toLowerCase()}` : undefined);
            const queryParams = {
                ...restParams,
                ...(normalizedSort ? { sort: normalizedSort } : {}),
            };

            const res = await axiosClient.get(API_URL, { params: queryParams });
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }
    async createMachine(data) {
        try {
            const response = await axiosClient.post(`${API_URL}`, data);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }
    async getMachineById(machineId) {
        try {
            const response = await axiosClient.get(`${API_URL}/${machineId}`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }
    async updateMachine(machineId, data) {
        try {
            const response = await axiosClient.put(`${API_URL}/${machineId}`, data);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }
    async deleteMachine(machineId) {
        try {
            const response = await axiosClient.delete(`${API_URL}/${machineId}`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }
}

export default new MachineService();
