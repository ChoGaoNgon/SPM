import axios from 'axios';
import { setAccessToken } from './authTokenStore';

let refreshPromise = null;

const SKIP_REFRESH_PATHS = ['/auth/login', '/auth/refresh', '/auth/logout'];
const TAB_ID_KEY = 'auth:tab-id';
const REFRESH_LOCK_KEY = 'auth:refresh-lock';
const REFRESH_RESULT_KEY = 'auth:refresh-result';
const REFRESH_LOCK_TTL_MS = 10000;
const REFRESH_WAIT_TIMEOUT_MS = 12000;

export const shouldSkipRefresh = (url = '') => SKIP_REFRESH_PATHS.some((path) => url.includes(path));

const readStorageJson = (key) => {
    try {
        const rawValue = localStorage.getItem(key);
        return rawValue ? JSON.parse(rawValue) : null;
    } catch {
        return null;
    }
};

const getTabId = () => {
    let tabId = sessionStorage.getItem(TAB_ID_KEY);
    if (!tabId) {
        tabId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        sessionStorage.setItem(TAB_ID_KEY, tabId);
    }
    return tabId;
};

const isActiveLock = (lockValue) => {
    if (!lockValue?.owner || !lockValue?.timestamp) {
        return false;
    }
    return Date.now() - lockValue.timestamp < REFRESH_LOCK_TTL_MS;
};

const publishRefreshResult = (status, data = null) => {
    localStorage.setItem(
        REFRESH_RESULT_KEY,
        JSON.stringify({
            status,
            data,
            owner: getTabId(),
            timestamp: Date.now(),
        }),
    );
};

const tryAcquireRefreshLock = () => {
    const currentTabId = getTabId();
    const currentLock = readStorageJson(REFRESH_LOCK_KEY);

    if (isActiveLock(currentLock) && currentLock.owner !== currentTabId) {
        return false;
    }

    localStorage.setItem(
        REFRESH_LOCK_KEY,
        JSON.stringify({
            owner: currentTabId,
            timestamp: Date.now(),
        }),
    );

    const confirmedLock = readStorageJson(REFRESH_LOCK_KEY);
    return confirmedLock?.owner === currentTabId;
};

const releaseRefreshLock = () => {
    const currentTabId = getTabId();
    const currentLock = readStorageJson(REFRESH_LOCK_KEY);
    if (currentLock?.owner === currentTabId) {
        localStorage.removeItem(REFRESH_LOCK_KEY);
    }
};

const applyRefreshData = (data) => {
    if (!data) return;
    if (data.token) setAccessToken(data.token);
    if (data.employee) localStorage.setItem('employee', JSON.stringify(data.employee));
    if (Array.isArray(data.permissions)) localStorage.setItem('permissions', JSON.stringify(data.permissions));
    if (typeof data.mustChangePassword === 'boolean')
        localStorage.setItem('mustChangePassword', String(data.mustChangePassword));
};

const waitForRefreshFromAnotherTab = () =>
    new Promise((resolve, reject) => {
        const latestResult = readStorageJson(REFRESH_RESULT_KEY);
        if (latestResult && Date.now() - latestResult.timestamp < REFRESH_WAIT_TIMEOUT_MS) {
            if (latestResult.status === 'success') {
                applyRefreshData(latestResult.data);
                resolve(latestResult.data);
                return;
            }
        }

        let resolved = false;

        const cleanup = () => {
            window.removeEventListener('storage', handleStorageChange);
            clearTimeout(timeoutId);
        };

        const finishSuccess = (data) => {
            if (resolved) return;
            resolved = true;
            cleanup();
            applyRefreshData(data);
            resolve(data);
        };

        const finishError = () => {
            if (resolved) return;
            resolved = true;
            cleanup();
            reject(new Error('Token refresh failed in another tab'));
        };

        const handleStorageChange = (event) => {
            if (event.key !== REFRESH_RESULT_KEY || !event.newValue) {
                return;
            }

            try {
                const payload = JSON.parse(event.newValue);
                if (!payload || Date.now() - payload.timestamp > REFRESH_WAIT_TIMEOUT_MS) {
                    return;
                }

                if (payload.status === 'success') {
                    finishSuccess(payload.data);
                    return;
                }

                if (payload.status === 'error') {
                    finishError();
                }
            } catch {
                finishError();
            }
        };

        const timeoutId = window.setTimeout(() => {
            if (!isActiveLock(readStorageJson(REFRESH_LOCK_KEY))) {
                const resultAfterTimeout = readStorageJson(REFRESH_RESULT_KEY);
                if (resultAfterTimeout?.status === 'success') {
                    finishSuccess(resultAfterTimeout.data);
                    return;
                }
            }
            finishError();
        }, REFRESH_WAIT_TIMEOUT_MS);

        window.addEventListener('storage', handleStorageChange);
    });

export const refreshAccessToken = () => {
    if (!refreshPromise) {
        refreshPromise = (async () => {
            const activeLock = readStorageJson(REFRESH_LOCK_KEY);

            if (isActiveLock(activeLock) && activeLock.owner !== getTabId()) {
                return waitForRefreshFromAnotherTab();
            }

            if (!tryAcquireRefreshLock()) {
                return waitForRefreshFromAnotherTab();
            }

            try {
                const response = await axios.post(
                    `${process.env.REACT_APP_API_URL}/auth/refresh`,
                    {},
                    { withCredentials: true },
                );
                const data = response?.data?.data;
                applyRefreshData(data);
                publishRefreshResult('success', data);
                return data;
            } catch (error) {
                publishRefreshResult('error');
                throw error;
            } finally {
                releaseRefreshLock();
            }
        })().finally(() => {
            refreshPromise = null;
        });
    }
    return refreshPromise;
};
