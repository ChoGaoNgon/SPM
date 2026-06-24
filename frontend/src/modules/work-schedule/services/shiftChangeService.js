import axiosClient from '~/utils/axiosClient';

const API_URL = '/shift-change';

class ShiftChangeService {
    async createRequest({ employeeId, currentShiftId, requestedShiftId, workDate, reason }) {
        try {
            const response = await axiosClient.post(`${API_URL}`, null, {
                params: {
                    employeeId,
                    currentShiftId,
                    requestedShiftId,
                    workDate,
                    reason,
                },
            });
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Không thể gửi yêu cầu đổi ca';
            throw new Error(errorMessage);
        }
    }

    async getMyRequests(employeeId) {
        try {
            const response = await axiosClient.get(`${API_URL}/my-requests/${employeeId}`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Không thể lấy danh sách yêu cầu đổi ca';
            throw new Error(errorMessage);
        }
    }

    async getPendingRequests(approverId) {
        try {
            const response = await axiosClient.get(`${API_URL}/pending/${approverId}`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Không thể lấy danh sách yêu cầu chờ duyệt';
            throw new Error(errorMessage);
        }
    }

    async getShiftChangeProcessedRequests(approverId, startDate, endDate) {
        try {
            const response = await axiosClient.get(`${API_URL}/history/${approverId}`, {
                params: {
                    startDate,
                    endDate,
                },
            });
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Không thể lấy danh sách yêu cầu đã xử lý';
            throw new Error(errorMessage);
        }
    }

    async approveRequest({ requestId, approverId, action, comment }) {
        try {
            const response = await axiosClient.post(`${API_URL}/${requestId}/approve`, null, {
                params: { approverId, action, comment },
            });
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Không thể phê duyệt yêu cầu đổi ca';
            throw new Error(errorMessage);
        }
    }

    async getRequestDetail(requestId) {
        try {
            const response = await axiosClient.get(`${API_URL}/${requestId}`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Không thể lấy chi tiết yêu cầu đổi ca';
            throw new Error(errorMessage);
        }
    }

    async getShiftChangeRequestHistoryByCreator(creatorId) {
        try {
            const response = await axiosClient.get(`${API_URL}/history/creator/${creatorId}`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Không thể lấy lịch sử yêu cầu đ ca theo người tạo';
            throw new Error(errorMessage);
        }
    }

    async directAssignShiftChange({ managerId, employeeId, currentShiftId, requestedShiftId, workDate, reason }) {
        try {
            const response = await axiosClient.post(`${API_URL}/direct-assign`, null, {
                params: { managerId, employeeId, currentShiftId, requestedShiftId, workDate, reason },
            });
            return response.data.data;
        } catch (error) {
            throw new Error(error?.response?.data?.message || 'Không thể chỉ định đổi ca');
        }
    }
}

const shiftChangeService = new ShiftChangeService();

export default shiftChangeService;
