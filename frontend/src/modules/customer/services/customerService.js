import axiosClient from '~/utils/axiosClient';

const API_URL = '/customers';

class CustomerService {
    async getAllCustomer() {
        try {
            const response = await axiosClient.get(`${API_URL}`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async getCustomerById(customerId) {
        try {
            const response = await axiosClient.get(`${API_URL}/${customerId}`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async createCustomer(data) {
        try {
            const response = await axiosClient.post(`${API_URL}`, data);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async updateCustomer(customerId, data) {
        try {
            const response = await axiosClient.put(`${API_URL}/${customerId}`, data);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async searchCustomers(param) {
        try {
            const response = await axiosClient.get(`${API_URL}/search`, {
                params: { param },
            });
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định khi tìm kiếm khách hàng';
            throw new Error(errorMessage);
        }
    }

    async deleteCustomer(customerId) {
        try {
            const response = await axiosClient.delete(`${API_URL}/${customerId}`);
            return response.data.message;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }
}

const customerService = new CustomerService();
export default customerService;
