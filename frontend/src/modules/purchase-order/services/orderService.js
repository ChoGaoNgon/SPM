import fileDownload from 'js-file-download';
import axiosClient from '~/utils/axiosClient';

const API_URL = '/orders';

class OrderService {
    async getOrders() {
        try {
            const response = await axiosClient.get(API_URL);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định khi lấy danh sách đơn hàng';
            throw new Error(errorMessage);
        }
    }

    async getOrderItemByOrderId(orderId) {
        try {
            const response = await axiosClient.get(`${API_URL}/${orderId}`);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error.message ||
                'Lỗi không xác định khi lấy danh sách sản phẩm trong đơn hàng';
            throw new Error(errorMessage);
        }
    }

    async createOrder(formData) {
        try {
            const response = await axiosClient.post(`${API_URL}/create-from-excel`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.message;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định khi tạo đơn hàng';
            throw new Error(errorMessage);
        }
    }

    async downloadTemplate() {
        try {
            const response = await axiosClient.get(`${API_URL}/template`, {
                responseType: 'blob',
            });

            const contentDisposition = response.headers['content-disposition'];
            const fileNameMatch = contentDisposition?.match(/filename="?(.+)"?/);
            const fileName = fileNameMatch ? fileNameMatch[1] : 'order-item-template.xlsx';

            fileDownload(response.data, fileName);
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi tải file mẫu';
            throw new Error(errorMessage);
        }
    }

    async updateReceivedInfo(orderItemId, data) {
        try {
            const response = await axiosClient.patch(`${API_URL}/items/${orderItemId}`, data);
            return response.data.message;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error.message ||
                'Lỗi không xác định khi cập nhật thông tin nhận hàng';
            throw new Error(errorMessage);
        }
    }

    async getOrdersByMaterialCode(material_code) {
        try {
            const response = await axiosClient.get(`${API_URL}/items/${material_code}`);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định khi lấy danh sách đơn hàng';
            throw new Error(errorMessage);
        }
    }
}

const orderService = new OrderService();
export default orderService;
