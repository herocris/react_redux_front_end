import axios from 'axios';
import { getEnvVariables } from '../helpers/getEnvVariables';
import { getSessionSignal } from './sessionScope';
import { rememberHttpFailure } from './apiErrors';
import { notifyForbidden } from './authorizationEvents';

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
        if (axios.isAxiosError(error) && error.response) {
            rememberHttpFailure(reason, error.response.status, error);
            // Never react to auth endpoints or to a retired request/session.
            if (error.response.status === 403 && error.config?.signal &&
                !/^\/(login|register|refresh|logout)$/.test(error.config.url ?? '')) {
                notifyForbidden(error.config.signal as AbortSignal);
            }
        }
        return Promise.reject(reason);
    },
)


export default calendarApi;
