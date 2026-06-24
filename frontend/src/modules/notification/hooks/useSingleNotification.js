import { useEffect, useState } from 'react';
import socket, { acquireSocketConnection, releaseSocketConnection } from '../socket';

export default function useSingleNotification(userId) {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!userId) return;

        acquireSocketConnection(userId);

        const handleNotification = (data) => {
            const notif = data.notification;
            if (!notif) return;
            if (!notif.receivers || !notif.receivers.includes(Number(userId))) return;

            setUnreadCount(data.unreadCount ?? 1);
        };

        socket.on('notification', handleNotification);

        return () => {
            socket.off('notification', handleNotification);
            releaseSocketConnection();
        };
    }, [userId]);

    return unreadCount;
}
