import { notification } from 'antd';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import socket from '~/modules/notification/socket';

const DEFAULT_RELOAD_DELAY_MS = 3000;
const MAX_RELOAD_DELAY_MS = 300000;
const RELOAD_NOTIFICATION_KEY = 'system-page-reload';

let reloadTimerId = null;
let reloadCountdownIntervalId = null;

function normalizeReloadDelay(rawDelayMs) {
    if (rawDelayMs === undefined || rawDelayMs === null || rawDelayMs === '') {
        return DEFAULT_RELOAD_DELAY_MS;
    }
    const parsed = Number(rawDelayMs);
    if (isNaN(parsed)) return DEFAULT_RELOAD_DELAY_MS;
    return Math.min(Math.max(0, parsed), MAX_RELOAD_DELAY_MS);
}

function usePermissions(initialPermissions = []) {
    const [permissions, setPermissions] = useState(initialPermissions);
    const [api, contextHolder] = notification.useNotification();
    const location = useLocation();

    useEffect(() => {
        const handler = (data) => {
            setPermissions(data.permissions || []);

            if (data.message) {
                api.info({
                    message: 'Cập nhật quyền',
                    description: <span dangerouslySetInnerHTML={{ __html: data.message }} />,
                    placement: 'topRight',
                });
            }

            if (data.permissions && Array.isArray(data.permissions)) {
                localStorage.setItem('permissions', JSON.stringify(data.permissions));
            }
        };

        socket.on('permissions', handler);

        return () => {
            socket.off('permissions', handler);
        };
    }, [api]);

    useEffect(() => {
        const pageReloadHandler = (data = {}) => {
            if (reloadTimerId) return;

            const delayMs = normalizeReloadDelay(data.delayMs);
            const msg = data.message || 'Hệ thống đang cập nhật.';
            let secondsRemaining = delayMs > 0 ? Math.max(1, Math.ceil(delayMs / 1000)) : 0;

            const openNotification = () => {
                api.warning({
                    key: RELOAD_NOTIFICATION_KEY,
                    message: 'Cập nhật hệ thống',
                    description: (
                        <span>
                            {msg}
                            {secondsRemaining > 0
                                ? ` Trang sẽ tự tải lại sau ${secondsRemaining} giây.`
                                : ' Đang tải lại...'}
                        </span>
                    ),
                    placement: 'topRight',
                    duration: 0,
                });
            };

            openNotification();

            if (delayMs > 0) {
                reloadCountdownIntervalId = window.setInterval(() => {
                    secondsRemaining = Math.max(0, secondsRemaining - 1);
                    openNotification();
                    if (secondsRemaining === 0) {
                        window.clearInterval(reloadCountdownIntervalId);
                        reloadCountdownIntervalId = null;
                    }
                }, 1000);
            }

            reloadTimerId = window.setTimeout(() => {
                if (reloadCountdownIntervalId) {
                    window.clearInterval(reloadCountdownIntervalId);
                    reloadCountdownIntervalId = null;
                }
                api.destroy(RELOAD_NOTIFICATION_KEY);
                window.location.reload();
            }, delayMs);
        };

        socket.on('page-reload', pageReloadHandler);

        return () => {
            socket.off('page-reload', pageReloadHandler);
            if (reloadTimerId) {
                window.clearTimeout(reloadTimerId);
                reloadTimerId = null;
            }
            if (reloadCountdownIntervalId) {
                window.clearInterval(reloadCountdownIntervalId);
                reloadCountdownIntervalId = null;
            }
        };
    }, [api]);

    return { permissions, contextHolder };
}

export default usePermissions;
