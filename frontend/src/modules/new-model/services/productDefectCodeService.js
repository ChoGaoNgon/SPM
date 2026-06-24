import axiosClient from '~/utils/axiosClient';

const API_URL = '/product-defect-codes';

const productDefectCodeService = {
    getAllDefectCodes: async () => {
        const response = await axiosClient.get(API_URL);
        return response.data.data;
    },

    getDefectCodeById: async (id) => {
        const response = await axiosClient.get(`${API_URL}/${id}`);
        return response.data;
    },

    createDefectCode: async (data) => {
        const response = await axiosClient.post(API_URL, data);
        return response.data;
    },

    updateDefectCode: async (id, data) => {
        const response = await axiosClient.put(`${API_URL}/${id}`, data);
        return response.data;
    },

    deleteDefectCode: async (id) => {
        const response = await axiosClient.delete(`${API_URL}/${id}`);
        return response.data;
    },
};

export default productDefectCodeService;
