import axiosClient from '~/utils/axiosClient';

const API_URL = '/attendance';

class AttendanceService {
    async getWindowsServiceStatus() {
        try {
            const response = await axiosClient.get(`${API_URL}/status-windows`);
            return response.data.message;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async fetchFromWindowsService() {
        try {
            const response = await axiosClient.get(`${API_URL}/fetch-windows`);
            return response.data.message;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async getFetchFromWindowsJobStatus() {
        try {
            const response = await axiosClient.get(`${API_URL}/fetch-windows-job-status`);
            return response.data.message;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async getDailyByDepartment(workDate, departmentId) {
        try {
            const response = await axiosClient.get(`${API_URL}/daily`, {
                params: { workDate, departmentId },
            });
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async getDailyByEmployee(workDate, employeeId) {
        try {
            const response = await axiosClient.get(`${API_URL}/daily`, {
                params: { workDate, employeeId },
            });
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async sync(startDate, endDate, employeeId = null) {
        try {
            const response = await axiosClient.post(`${API_URL}/sync`, null, {
                params: { startDate, endDate, employeeId },
            });
            return response.data.message;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async getRawLogs(startDate = null, endDate = null, employeeId = null, page = 0, size = 50) {
        try {
            const response = await axiosClient.get(`${API_URL}/raw-logs`, {
                params: { startDate, endDate, employeeId, page, size },
            });
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }
}

const attendanceService = new AttendanceService();
export default attendanceService;
