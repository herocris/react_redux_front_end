import axios, { AxiosError } from 'axios';
import { getEnvVariables } from '../helpers/getEnvVariables';

const { VITE_API_URL } = getEnvVariables()


const calendarApi = axios.create({
    baseURL: VITE_API_URL,
    withCredentials: true,
});

// // Todo: configurar interceptores
calendarApi.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.isAxiosError) {
            const {response} = error as AxiosError
            const err = response?.data
            return Promise.reject(err)
        }
    },
)


export default calendarApi;

// import axios, {  } from 'axios';
// import { getEnvVariables } from '../helpers/getEnvVariables';

// const { VITE_API_URL } = getEnvVariables();

// const calendarApi = axios.create({
//     baseURL: VITE_API_URL,
// });

// // ✅ Interceptor para agregar token en cada request
// calendarApi.interceptors.request.use((config) => {
//     const token = typeof localStorage !== 'undefined'
//         ? localStorage.getItem('token')
//         : null;

//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
// });

// // ✅ Interceptor para manejar errores globales
// calendarApi.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (axios.isAxiosError(error)) {
//             const status = error.response?.status;

//             // 🔒 Si el token expiró o no es válido → Logout automático
//             if (status === 401) {
//                 localStorage.removeItem('token');
//                 //window.location.href = '/login';
//             }

//             return Promise.reject(error.response?.data ?? error);
//         }

//         return Promise.reject(error);
//     }
// );

// export default calendarApi;
