import axios from 'axios';

const getSocketBaseUrl = () => process.env.REACT_APP_SOCKET_HOST || '';
export async function broadcastPageReload(payload = {}) {
    const { message, delaySeconds, receivers } = payload;

    const body = {
        message: message || '',
        delaySeconds: delaySeconds ?? 3,
        delayMs: (delaySeconds ?? 3) * 1000,
        ...(receivers && receivers.length > 0 ? { receivers } : {}),
    };

    const response = await axios.post(`${getSocketBaseUrl()}/ws/page-reload`, body, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
    });

    return response.data; 
}
