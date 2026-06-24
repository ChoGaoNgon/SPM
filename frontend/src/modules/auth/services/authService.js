import { message } from 'antd';
import { clearAccessToken, getAccessToken, setAccessToken } from '~/utils/authTokenStore';
import axiosClient from '~/utils/axiosClient';

const HTMP_PLAN_STATUSES_STORAGE_KEY = 'htmpPlanStatuses';

class AuthService {
    clearClientAuthState({ redirectToLogin = true } = {}) {
        clearAccessToken();
        localStorage.removeItem('employee');
        localStorage.removeItem('permissions');
        localStorage.removeItem('mustChangePassword');
        localStorage.removeItem(HTMP_PLAN_STATUSES_STORAGE_KEY);
        localStorage.setItem('logout-event', Date.now().toString());

        if (redirectToLogin && window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
    }

    notifyLogout(messageText) {
        if (messageText) {
            message.warning(messageText);
        }
    }

    async preloadHtmpPlanStatuses() {
        try {
            const response = await axiosClient.get('/products/plans/statuses');
            const statuses = Array.isArray(response?.data?.data) ? response.data.data : [];
            localStorage.setItem(HTMP_PLAN_STATUSES_STORAGE_KEY, JSON.stringify(statuses));
            return statuses;
        } catch {
            return [];
        }
    }

    async login(code, password) {
        try {
            const response = await axiosClient.post('/auth/login', { code, password });
            const { token, employee, permissions, mustChangePassword } = response.data.data;

            setAccessToken(token);

            localStorage.setItem('employee', JSON.stringify(employee) || '{}');
            localStorage.setItem('mustChangePassword', mustChangePassword || false);

            if (permissions && Array.isArray(permissions)) {
                localStorage.setItem('permissions', JSON.stringify(permissions));
            }

            await this.preloadHtmpPlanStatuses();

            return response.data.data;
        } catch (err) {
            const errorMessage = err?.response?.data?.message || 'Đăng nhập thất bại, vui lòng thử lại.';
            throw new Error(errorMessage);
        }
    }

    async logout() {
        if (this._logoutInProgress) {
            return this._logoutPromise;
        }

        this._logoutInProgress = true;
        this._logoutPromise = (async () => {
            try {
                if (!this.isAuthenticated()) {
                    this.clearClientAuthState();
                    return;
                }

                await axiosClient.post('/auth/logout');
            } catch (err) {
            } finally {
                try {
                    this.clearClientAuthState();
                } finally {
                    this._logoutInProgress = false;
                    this._logoutPromise = null;
                    localStorage.clear();
                }
            }
        })();

        return this._logoutPromise;
    }

    async changePassword(employeeId, oldPassword, newPassword) {
        try {
            const res = await axiosClient.post('/auth/change-password', {
                employeeId,
                oldPassword,
                newPassword,
            });

            return res.data.data;
        } catch (err) {
            const message = err?.response?.data?.message || 'Đổi mật khẩu thất bại, vui lòng thử lại.';
            throw new Error(message);
        }
    }

    isAuthenticated() {
        return !!this.getEmployee() && !!this.getToken();
    }

    getToken() {
        return getAccessToken();
    }

    getUserInfo() {
        return this.getEmployee();
    }

    getEmployee() {
        try {
            const emp = localStorage.getItem('employee');
            return emp ? JSON.parse(emp) : null;
        } catch {
            return null;
        }
    }

    getPermissions() {
        try {
            const perms = localStorage.getItem('permissions');
            return perms ? JSON.parse(perms) : [];
        } catch {
            return [];
        }
    }

    getEmployeeId() {
        const employee = JSON.parse(localStorage.getItem('employee'));
        return employee?.id || null;
    }

    getEmployeeCode() {
        const employee = JSON.parse(localStorage.getItem('employee'));
        return employee?.code || null;
    }

    getDepartmentId() {
        const employee = JSON.parse(localStorage.getItem('employee'));
        return employee?.departmentId || null;
    }

    getDepartmentCode() {
        const employee = JSON.parse(localStorage.getItem('employee'));
        return employee?.departmentCode || null;
    }

    getParentDepartmentCode() {
        const employee = JSON.parse(localStorage.getItem('employee'));
        return employee?.parrentDepartmentCode || null;
    }

    getRole() {
        const employee = JSON.parse(localStorage.getItem('employee'));
        return employee?.role || null;
    }

    hasPermission(code) {
        const stored = localStorage.getItem('permissions');
        const perms = stored ? JSON.parse(stored) : [];
        return perms.includes(code);
    }

    hasRole(role) {
        const employee = JSON.parse(localStorage.getItem('employee'));
        return employee?.role === role;
    }

    hasDepartmentCode(code) {
        const employee = JSON.parse(localStorage.getItem('employee'));
        return employee?.departmentCode === code;
    }

    isInDepartments(departmentCodes = []) {
        const employee = this.getEmployee();
        if (!employee) return false;

        const parentDeptCode = employee.parentDepartmentCode || employee.departmentCode;
        return departmentCodes.includes(parentDeptCode);
    }
}

const authService = new AuthService();
export default authService;
