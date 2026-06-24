import axiosClient from '~/utils/axiosClient';

const API_URL = '/daily-reports';

const dailyWorkReportService = {
    getAll: async () => {
        try {
            const response = await axiosClient.get(API_URL);
            return response.data;
        } catch (error) {
            return [];
        }
    },

    getByDate: async (date) => {
        try {
            const response = await axiosClient.get(API_URL, {
                params: { date },
            });
            return response.data;
        } catch (error) {
            return [];
        }
    },

    getByEmployeeAndDate: async (employeeId, date) => {
        try {
            const response = await axiosClient.get(API_URL, {
                params: { employeeId, date },
            });
            return response.data;
        } catch (error) {
            return [];
        }
    },

    create: async (payload) => {
        const formData = new FormData();

        if (payload.file) formData.append('file', payload.file);

        formData.append('employeeId', payload.employeeId);

        formData.append('startDateTime', payload.startDateTime);
        formData.append('endDateTime', payload.endDateTime);
        formData.append('taskDescription', payload.taskDescription);

        const response = await axiosClient.post(API_URL, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.message;
    },

    update: async (id, payload) => {
        try {
            const formData = new FormData();

            if (payload.file) formData.append('file', payload.file);

            formData.append('employeeId', payload.employeeId);
            formData.append('startDateTime', payload.startDateTime);
            formData.append('endDateTime', payload.endDateTime);
            formData.append('taskDescription', payload.taskDescription);

            const response = await axiosClient.put(`${API_URL}/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            return response.data.message;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.response?.data ||
                error.message ||
                'Lỗi không xác định khi cập nhật báo cáo';
            throw new Error(errorMessage);
        }
    },

    delete: async (id) => {
        try {
            const response = await axiosClient.delete(`${API_URL}/${id}`);
            return response.data.message;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.response?.data ||
                error.message ||
                'Lỗi không xác định khi xóa báo cáo';
            throw new Error(errorMessage);
        }
    },
};

export default dailyWorkReportService;
