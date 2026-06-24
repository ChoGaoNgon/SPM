import axiosClient from '~/utils/axiosClient';

const API_URL = '/production-lots';

const productionLotService = {
    createProductionLot: async (data) => {
        const response = await axiosClient.post(API_URL, data);
        return response.data;
    },

    updateProductionLot: async (id, data) => {
        const response = await axiosClient.put(`${API_URL}/${id}`, data);
        return response.data;
    },

    deleteProductionLot: async (id) => {
        const response = await axiosClient.delete(`${API_URL}/${id}`);
        return response.data;
    },

    getProductionLotById: async (id) => {
        const response = await axiosClient.get(`${API_URL}/${id}`);
        return response.data.data;
    },

    getAllProductionLots: async () => {
        const response = await axiosClient.get(API_URL);
        return response.data.data;
    },

    getProductionLotsByProductPlan: async (productPlanId) => {
        const response = await axiosClient.get(`${API_URL}/by-product-plan/${productPlanId}`);
        return response.data.data;
    },

    getProductionLotsByDateRange: async (startDate, endDate) => {
        const response = await axiosClient.get(`${API_URL}/by-date-range`, {
            params: { startDate, endDate },
        });
        return response.data.data;
    },

    getProductionStatistics: async (startDate, endDate) => {
        const response = await axiosClient.get(`${API_URL}/statistics`, {
            params: { startDate, endDate },
        });
        return response.data.data;
    },

    getLatestProductionLot: async (productPlanId) => {
        const response = await axiosClient.get(`${API_URL}/latest/${productPlanId}`);
        return response.data.data;
    },
};

export default productionLotService;
