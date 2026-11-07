import axios from 'axios';
import { getEnvVariables } from '../helpers/getEnvVariables';

const { VITE_API_URL } = getEnvVariables()


const calendarApi = axios.create({
    baseURL: VITE_API_URL,
    withCredentials: true,
});

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
