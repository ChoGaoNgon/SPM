import axios from 'axios';
import { clearAccessToken, getAccessToken } from './authTokenStore';
import { trackGlobalLoadingRequest, untrackGlobalLoadingRequest } from './globalLoadingManager';
import { refreshAccessToken, shouldSkipRefresh } from './tokenRefresh';

const clearLocalAuthState = () => {
    clearAccessToken();
    localStorage.removeItem('employee');
    localStorage.removeItem('permissions');
    localStorage.removeItem('mustChangePassword');
    localStorage.setItem('logout-event', Date.now().toString());
};

const axiosClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true,
});

axiosClient.interceptors.request.use(
    (config) => {
        trackGlobalLoadingRequest(config);

        const token = getAccessToken();
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        untrackGlobalLoadingRequest(error);
        return Promise.reject(error);
    },
);

axiosClient.interceptors.response.use(
    (response) => {
        untrackGlobalLoadingRequest(response);
        return response;
    },
    async (error) => {
        untrackGlobalLoadingRequest(error);

        if (!error.response) {
            return Promise.reject(error);
        }

        const { status } = error.response;
        const originalRequest = error.config || {};

        const shouldAttemptRefresh =
            status === 401 && !originalRequest._retry && !shouldSkipRefresh(originalRequest.url || '');

        if (shouldAttemptRefresh) {
            originalRequest._retry = true;

            try {
                await refreshAccessToken();
                return axiosClient(originalRequest);
            } catch {
                clearLocalAuthState();
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }

        if (status === 401) {
            if (shouldSkipRefresh(originalRequest.url || '')) {
                return Promise.reject(error);
            }

            clearLocalAuthState();
            window.location.href = '/login';
            return Promise.reject(error);
        }

        if (status === 403) {
        }

        return Promise.reject(error);
    },
);

export default axiosClient;
