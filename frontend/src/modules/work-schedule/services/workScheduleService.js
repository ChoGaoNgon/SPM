import axiosClient from '~/utils/axiosClient';

const API_URL = '/work-schedules';

class WorkScheduleService {
    async getWorkScheduleByDepartment(departmentId, month, year) {
        try {
            const response = await axiosClient.get(`${API_URL}/department/${departmentId}`, {
                params: { month, year },
            });
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async getWorkScheduleByEmployee(employeeId, month, year) {
        try {
            const response = await axiosClient.get(`${API_URL}/employee/${employeeId}`, {
                params: { month, year },
            });
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async getDailySchedule(employeeId, date) {
        try {
            const response = await axiosClient.get(`${API_URL}/employee/${employeeId}/day`, {
                params: { date },
            });
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Không thể lấy lịch làm việc trong ngày';
            throw new Error(errorMessage);
        }
    }

    async saveSchedulesOnce(data) {
        try {
            const response = await axiosClient.post(`${API_URL}`, data);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async updateSchedulesOnce(employeeId, date, newShiftId) {
        try {
            const response = await axiosClient.patch(`${API_URL}`, null, {
                params: { employeeId, date, newShiftId },
            });
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async exportWorkSchedule(departmentId, year, month) {
        try {
            const response = await axiosClient.get(`${API_URL}/export`, {
                params: { departmentId, year, month },
                responseType: 'blob',
            });

            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `schedule-dept-${departmentId}-${year}-${month}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi khi xuất Excel';
            throw new Error(errorMessage);
        }
    }

    async getDailyStats(departmentId, date) {
        try {
            const response = await axiosClient.get(`${API_URL}/stats/daily`, {
                params: { departmentId, date },
            });
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(errorMessage);
        }
    }

    async importWorkSchedule(file, month, year) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('month', month);
            formData.append('year', year);

            const response = await axiosClient.post(`${API_URL}/import`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi khi import lịch làm việc';
            throw new Error(errorMessage);
        }
    }

    async syncWorkSchedule(year, month, useCodeHcns = true) {
        try {
            const response = await axiosClient.post(`${API_URL}/sync`, null, {
                params: { year, month, useCodeHcns },
            });
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Lỗi khi đồng bộ lịch làm việc từ API bên ngoài';
            throw new Error(errorMessage);
        }
    }
}

const workScheduleService = new WorkScheduleService();

export default workScheduleService;
