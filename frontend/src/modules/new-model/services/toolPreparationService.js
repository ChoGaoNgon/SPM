import axiosClient from '~/utils/axiosClient';

const API_URL = '/products/tool-preparations';

const toolPreparationService = {
    getByProduct: async (productId) => {
        const response = await axiosClient.get(`${API_URL}/product/${productId}`);
        return response.data;
    },

    getById: async (id) => {
        const response = await axiosClient.get(`${API_URL}/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await axiosClient.post(API_URL, data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await axiosClient.put(`${API_URL}/${id}`, data);
        return response.data;
    },

    updateStatus: async (id, status) => {
        const response = await axiosClient.patch(`${API_URL}/${id}/status`, null, {
            params: { status },
        });
        return response.data;
    },

    delete: async (id) => {
        const response = await axiosClient.delete(`${API_URL}/${id}`);
        return response.data;
    },

    checkReadyStatus: async (productId) => {
        const response = await axiosClient.get(`${API_URL}/product/${productId}/ready-status`);
        return response.data;
    },

    getByEmployee: async (employeeId) => {
        const response = await axiosClient.get(`${API_URL}/employee/${employeeId}`);
        return response.data;
    },

    updateItems: async (preparationId, items) => {
        const response = await axiosClient.put(`${API_URL}/${preparationId}`, {
            items: items,
        });
        return response.data;
    },
};

export default toolPreparationService;
