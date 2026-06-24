import axiosClient from '~/utils/axiosClient';

class EmployeeSessionService {
    async getActiveSessions() {
        const res = await axiosClient.get('/sessions/active');
        return res.data;
    }

    async logoutEmployee(employeeId) {
        const res = await axiosClient.delete(`/sessions/employee/${employeeId}`);
        return res.data;
    }
}
const employeeSessionService = new EmployeeSessionService();
export default employeeSessionService;
