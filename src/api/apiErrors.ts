export type ApiErrorMessage = string | Record<string, string[]>;

const fallbackMessage = 'No se pudo completar la solicitud. Inténtalo de nuevo.';

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

export const getApiErrorMessage = (error: unknown): ApiErrorMessage => {
    if (isRecord(error)) {
        const details = error.error;
        if (typeof details === 'string' && details.trim()) return details;
        if (isRecord(details) && Object.keys(details).length > 0) {
            const fields: Record<string, string[]> = {};
            for (const [key, value] of Object.entries(details)) {
                if (typeof value === 'string') fields[key] = [value];
                else if (Array.isArray(value) && value.every(item => typeof item === 'string')) fields[key] = value;
            }
            if (Object.keys(fields).length > 0) return fields;
        }
        if (error.isAxiosError === true && !error.response) {
            return 'No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.';
        }
    }
    return fallbackMessage;
};

export const getApiErrorText = (error: unknown): string => {
    const message = getApiErrorMessage(error);
    return typeof message === 'string' ? message : Object.values(message).flat().join(' ') || fallbackMessage;
};
