import axiosClient from '~/utils/axiosClient';

const API_URL = '/mail-addresses';

class MailAddressService {
    async createMailAddress(data) {
        try {
            const res = await axiosClient.post(`${API_URL}`, data);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi tạo mới Bomlist';
            throw new Error(errorMessage);
        }
    }

    async updateMailAddress(id, data) {
        try {
            const res = await axiosClient.put(`${API_URL}/${id}`, data);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data.message || error.message || 'Lỗi khi chỉnh sửa Bomlist';
            throw new Error(errorMessage);
        }
    }

    async getAllMailAddresses() {
        try {
            const res = await axiosClient.get(`${API_URL}`);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data.message || error.message || 'Lỗi khi lấy thông tin Bomlist';
            throw new Error(errorMessage);
        }
    }

    async deleteMailAddress(id) {
        try {
            const res = await axiosClient.delete(`${API_URL}/${id}`);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data.message || error.message || 'Lỗi khi xóa địa chỉ mail';
            throw new Error(errorMessage);
        }
    }

    async checkEmailExists(email) {
        try {
            const res = await axiosClient.get(`${API_URL}/check-email/${email}`);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data.message || error.message || 'Lỗi khi kiểm tra email';
            throw new Error(errorMessage);
        }
    }

    async getMailAddressesByDepartment(departmentId) {
        try {
            const res = await axiosClient.get(`${API_URL}/department/${departmentId}`);
            return res.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data.message || error.message || 'Lỗi khi lấy địa chỉ mail theo phòng ban';
            throw new Error(errorMessage);
        }
    }

    async getAllActiveMailAddresses() {
        try {
            const res = await axiosClient.get(`${API_URL}/active`);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data.message || error.message || 'Lỗi khi lấy địa chỉ mail hoạt động';
            throw new Error(errorMessage);
        }
    }

    async getMailAddressById(id) {
        try {
            const res = await axiosClient.get(`${API_URL}/${id}`);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data.message || error.message || 'Lỗi khi lấy thông tin địa chỉ mail';
            throw new Error(errorMessage);
        }
    }

    async getMailAddressByEmail(email) {
        try {
            const res = await axiosClient.get(`${API_URL}/email/${email}`);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data.message || error.message || 'Lỗi khi lấy thông tin địa chỉ mail';
            throw new Error(errorMessage);
        }
    }
}

const mailAddressService = new MailAddressService();
export default mailAddressService;
