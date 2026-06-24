import axiosClient from '~/utils/axiosClient';

const API_URL = '/machine-specifications';

class MachineSpecificationService {
    async getAllMachineSpecifications(params = {}) {
        try {
            const { sortBy, sortDir, sort, ...restParams } = params;
            const normalizedSort = sort || (sortBy ? `${sortBy},${(sortDir || 'desc').toLowerCase()}` : undefined);
            const queryParams = {
                ...restParams,
                ...(normalizedSort ? { sort: normalizedSort } : {}),
            };

            const response = await axiosClient.get(API_URL, { params: queryParams });
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async getMachineSpecificationByMachineId(machineId) {
        try {
            const response = await axiosClient.get(`${API_URL}/machine/${machineId}`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async createMachineSpecification(machineIdOrPayload, payload) {
        try {
            const hasMachineId = payload !== undefined;
            const endpoint = hasMachineId ? `${API_URL}/machine/${machineIdOrPayload}` : API_URL;
            const requestBody = hasMachineId ? payload : machineIdOrPayload;
            const response = await axiosClient.post(endpoint, requestBody);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async updateMachineSpecificationByMachineId(machineId, payload) {
        try {
            const response = await axiosClient.put(`${API_URL}/machine/${machineId}`, payload);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async updateMachineSpecification(specificationId, payload) {
        try {
            const response = await axiosClient.put(`${API_URL}/${specificationId}`, payload);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async deleteMachineSpecificationByMachineId(machineId) {
        try {
            const response = await axiosClient.delete(`${API_URL}/machine/${machineId}`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async deleteMachineSpecification(specificationId) {
        try {
            const response = await axiosClient.delete(`${API_URL}/${specificationId}`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }
}

export default new MachineSpecificationService();
