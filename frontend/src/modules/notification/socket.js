import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_HOST;
const socket = io(SOCKET_URL, {
    autoConnect: false,
});

let socketConsumers = 0;
let registeredUserId = null;

const registerCurrentUser = () => {
    if (registeredUserId && socket.connected) {
        socket.emit('register', registeredUserId);
    }
};

socket.on('connect', registerCurrentUser);

export const acquireSocketConnection = (userId) => {
    socketConsumers += 1;

    if (userId) {
        registeredUserId = String(userId);
    }

    if (!socket.connected) {
        socket.connect();
        return;
    }

    registerCurrentUser();
};

export const releaseSocketConnection = () => {
    socketConsumers = Math.max(0, socketConsumers - 1);
    if (socketConsumers === 0 && socket.connected) {
        socket.disconnect();
    }
};

export const registerSocketUser = (userId) => {
    registeredUserId = userId ? String(userId) : null;
    registerCurrentUser();
};

export default socket;
