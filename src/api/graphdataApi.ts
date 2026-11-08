import axios from 'axios';
import { getEnvVariables } from '../helpers/getEnvVariables';
import { getSessionSignal } from './sessionScope';

const { VITE_API_URL } = getEnvVariables()


const calendarApi = axios.create({
    baseURL: VITE_API_URL,
    withCredentials: true,
});

calendarApi.interceptors.request.use(config => {
    // App callers use native AbortSignals; any preserves query/list cancellation
    // without retaining a listener for each completed request on the session.
    config.signal = config.signal
        ? AbortSignal.any([getSessionSignal(), config.signal as AbortSignal])
        : getSessionSignal();
    return config;
}, undefined, { synchronous: true });

calendarApi.interceptors.response.use(
    (response) => {
        return response
    },
    (error: unknown) => {
        const reason = axios.isAxiosError<unknown>(error)
            ? error.response?.data ?? error
            : error;
        return Promise.reject(reason);
    },
)


export default calendarApi;
