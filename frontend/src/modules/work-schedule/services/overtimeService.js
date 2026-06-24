import dayjs from 'dayjs';
import axiosClient from '~/utils/axiosClient';

const API_URL = '/overtimes';

class OvertimeService {
    async createRequest({ employeeId, startTime, endTime, reason }) {
        try {
            const response = await axiosClient.post(`${API_URL}`, null, {
                params: {
                    employeeId,
                    startTime: startTime,
                    endTime: endTime,
                    reason,
                },
            });
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Không thể gửi yêu cầu tăng ca';
            throw new Error(errorMessage);
        }
    }

    async createBatchRequest(requests) {
        try {
            const response = await axiosClient.post(`${API_URL}/batch-create`, requests);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Không thể lập danh sách yêu cầu tăng ca hàng loạt';
            throw new Error(errorMessage);
        }
    }

    async getMyRequests(employeeId) {
        try {
            const response = await axiosClient.get(`${API_URL}/my-requests/${employeeId}`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Không thể lấy danh sách yêu cầu tăng ca';
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

    async getProcessedRequests(approverId, startDate, endDate) {
        try {
            const response = await axiosClient.get(`${API_URL}/history/${approverId}`, {
                params: { startDate, endDate },
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
            const errorMessage = error?.response?.data?.message || 'Không thể phê duyệt yêu cầu tăng ca';
            throw new Error(errorMessage);
        }
    }

    async getRequestDetail(requestId) {
        try {
            const response = await axiosClient.get(`${API_URL}/${requestId}`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Không thể lấy chi tiết yêu cầu tăng ca';
            throw new Error(errorMessage);
        }
    }

    async checkOvertimeRequest(employeeId, date) {
        try {
            const formattedDate = typeof date === 'string' ? date : date.format('YYYY-MM-DD');
            const response = await axiosClient.get(`${API_URL}/check-request`, {
                params: { employeeId, date: formattedDate },
            });
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Không thể kiểm tra yêu cầu tăng ca';
            throw new Error(errorMessage);
        }
    }

    async assignOvertime({ managerId, employeeId, startTime, endTime, reason }) {
        try {
            const response = await axiosClient.post(`${API_URL}/assign`, null, {
                params: { managerId, employeeId, startTime, endTime, reason },
            });
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Không thể giao OT cho nhân viên';
            throw new Error(errorMessage);
        }
    }

    async respondAssignedOvertime({ requestId, employeeId, action, reason }) {
        try {
            const response = await axiosClient.post(`${API_URL}/${requestId}/respond`, null, {
                params: { employeeId, action, reason },
            });
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Không thể phản hồi OT được giao';
            throw new Error(errorMessage);
        }
    }

    async getAssignedOvertime(employeeId) {
        try {
            const response = await axiosClient.get(`${API_URL}/assigned/${employeeId}`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Không thể lấy danh sách OT được giao';
            throw new Error(errorMessage);
        }
    }

    async getOvertimeRequestHistoryByCreator(creatorId) {
        try {
            const response = await axiosClient.get(`${API_URL}/history/creator/${creatorId}`);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || 'Không thể lấy lịch sử yêu cầu tăng ca theo người tạo';
            throw new Error(errorMessage);
        }
    }

    async directAssignOvertime({ managerId, employeeId, startTime, endTime, reason }) {
        try {
            const response = await axiosClient.post(`${API_URL}/direct-assign`, null, {
                params: { managerId, employeeId, startTime, endTime, reason },
            });
            return response.data.data;
        } catch (error) {
            throw new Error(error?.response?.data?.message || 'Không thể chỉ định tăng ca');
        }
    }

    async exportApprovedOvertime(startDate, endDate) {
        try {
            const formattedStart = dayjs(startDate).format('YYYY-MM-DD');
            const formattedEnd = dayjs(endDate).format('YYYY-MM-DD');

            const response = await axiosClient.get(`${API_URL}/export-approved`, {
                params: { startDate: formattedStart, endDate: formattedEnd },
                responseType: 'blob',
            });

            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `overtime_${formattedStart}_to_${formattedEnd}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Không thể xuất Excel OT đã duyệt';
            throw new Error(errorMessage);
        }
    }
}

const overtimeService = new OvertimeService();
export default overtimeService;
