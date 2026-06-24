import axios from 'axios';

const AUTH_TOKEN = `token ${process.env.REACT_APP_FRAPPE_TOKEN}`;

const commonConfig = {
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json',
        Authorization: AUTH_TOKEN,
    },
};

const axiosClient444 = axios.create({
    baseURL: process.env.REACT_APP_FRAPPE_HOST,
    ...commonConfig,
});

const axiosClient445 = axios.create({
    baseURL: process.env.REACT_APP_NODE_HOST,
    ...commonConfig,
});

const requestInterceptor = (config) => {
    config.headers.Authorization = AUTH_TOKEN;
    return config;
};

const responseSuccessInterceptor = (response) => response;
const responseErrorInterceptor = (error) => {
    if (error.response) {
        const { status } = error.response;
        if (status === 401) {
        } else if (status === 403) {
        }
    }
    return Promise.reject(error);
};

[axiosClient444, axiosClient445].forEach((client) => {
    client.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error));
    client.interceptors.response.use(responseSuccessInterceptor, responseErrorInterceptor);
});

export default axiosClient444;

export { axiosClient445 };
