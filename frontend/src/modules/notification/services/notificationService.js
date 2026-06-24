import authService from '~/modules/auth/services/authService';
import axiosClient from '~/utils/axiosClient';

const API_URL = '/notifications';

class NotificationService {
    async getUnreadCount() {
        try {
            const employeeId = authService.getEmployeeId();
            const response = await axiosClient.get(`${API_URL}/${employeeId}/unread-count`);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định khi lấy 10 thông báo';
            throw new Error(errorMessage);
        }
    }

    async get10Notification() {
        try {
            const employeeId = authService.getEmployeeId();
            const response = await axiosClient.get(`${API_URL}/${employeeId}`);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định khi lấy 10 thông báo';
            throw new Error(errorMessage);
        }
    }

    async getAllNotification() {
        try {
            const employeeId = authService.getEmployeeId();
            const response = await axiosClient.get(`${API_URL}/all/${employeeId}`);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định khi lấy tất cả thông báo';
            throw new Error(errorMessage);
        }
    }

    async markAsRead(notificationId) {
        try {
            const employeeId = authService.getEmployeeId();
            const response = await axiosClient.patch(`${API_URL}/${employeeId}/read`, null, {
                params: { notificationId },
            });
            return response.data.message || 'Đã đánh dấu thông báo là đã đọc';
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định khi đánh dấu thông báo đã đọc';
            throw new Error(errorMessage);
        }
    }

    async markAllAsRead() {
        try {
            const employeeId = authService.getEmployeeId();
            const response = await axiosClient.patch(`${API_URL}/${employeeId}/read-all`);
            return response.data.message || 'Đã đánh dấu tất cả thông báo là đã đọc';
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error.message ||
                'Lỗi không xác định khi đánh dấu tất cả thông báo đã đọc';
            throw new Error(errorMessage);
        }
    }

    async getAllEvents() {
        try {
            const response = await axiosClient.get(`${API_URL}/events`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi không xác định khi lấy danh sách sự kiện';
            throw new Error(errorMessage);
        }
    }

    async getAllTypes() {
        try {
            const response = await axiosClient.get(`${API_URL}/types`);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || 'Lỗi không xác định khi lấy danh sách loại thông báo';
            throw new Error(errorMessage);
        }
    }
}

const notificationService = new NotificationService();
export default notificationService;
