import axiosClient from '~/utils/axiosClient';

const API_URL = '/department-schedule-lock';

class DepartmentScheduleLockService {
    async checkLock(departmentId, year, month) {
        try {
            const response = await axiosClient.get(`${API_URL}/check`, {
                params: { departmentId, year, month },
            });
            return response.data.data;
        } catch (error) {
            const msg = error?.response?.data?.message || error.message || 'Lỗi không xác định';
            throw new Error(msg);
        }
    }

    async lock(departmentId, year, month) {
        try {
            const response = await axiosClient.post(`${API_URL}/lock`, null, {
                params: { departmentId, year, month },
            });
            return response.data.data;
        } catch (error) {
            const msg = error?.response?.data?.message || error.message || 'Lỗi khi khóa phòng';
            throw new Error(msg);
        }
    }

    async unlock(departmentId, year, month) {
        try {
            const response = await axiosClient.post(`${API_URL}/unlock`, null, {
                params: { departmentId, year, month },
            });
            return response.data.data;
        } catch (error) {
            const msg = error?.response?.data?.message || error.message || 'Lỗi khi mở khóa phòng';
            throw new Error(msg);
        }
    }

    async getDepartmentsWithLockStatus(year, month) {
        try {
            const response = await axiosClient.get(`${API_URL}/list`, {
                params: { year, month },
            });
            return response.data.data;
        } catch (error) {
            const msg = error?.response?.data?.message || error.message || 'Lỗi khi lấy danh sách phòng';
            throw new Error(msg);
        }
    }

    async lockDepartments(departmentIds, year, month) {
        try {
            const response = await axiosClient.post(`${API_URL}/lock-multiple`, departmentIds, {
                params: { year, month },
            });
            return response.data.data;
        } catch (error) {
            const msg = error?.response?.data?.message || error.message || 'Lỗi khi khóa nhiều phòng';
            throw new Error(msg);
        }
    }

    async unlockDepartments(departmentIds, year, month) {
        try {
            const response = await axiosClient.post(`${API_URL}/unlock-multiple`, departmentIds, {
                params: { year, month },
            });
            return response.data.data;
        } catch (error) {
            const msg = error?.response?.data?.message || error.message || 'Lỗi khi mở khóa nhiều phòng';
            throw new Error(msg);
        }
    }
}

const departmentScheduleLockService = new DepartmentScheduleLockService();

export default departmentScheduleLockService;
