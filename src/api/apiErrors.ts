export type ApiErrorMessage = string | Record<string, string[]>;

const fallbackMessage = 'No se pudo completar la solicitud. Inténtalo de nuevo.';

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

// Keep the public rejection (including its identity/validation fields) intact.
// Metadata is private and collected with the body; never add Axios config to Redux.
const httpFailures = new WeakMap<object, { status: number; cause: unknown }>();

export const rememberHttpFailure = (body: unknown, status: number, cause: unknown): void => {
    if (typeof body === 'object' && body !== null) httpFailures.set(body, { status, cause });
};

export const getApiErrorCause = (error: unknown): unknown =>
    typeof error === 'object' && error !== null ? httpFailures.get(error)?.cause ?? error : error;

export const getApiErrorStatus = (error: unknown): number | undefined => {
    if (!isRecord(error)) return undefined;
    const status = httpFailures.get(error)?.status ??
        (isRecord(error.response) ? error.response.status : undefined) ?? error.code ?? error.status;
    return typeof status === 'number' && Number.isInteger(status) && status >= 400 && status <= 599
        ? status : undefined;
};

export type ApiErrorKind = 'forbidden' | 'unauthenticated' | 'transport' | 'server' | 'other';

export const getApiErrorKind = (error: unknown): ApiErrorKind => {
    const status = getApiErrorStatus(error);
    if (status === 403) return 'forbidden';
    if (status === 401) return 'unauthenticated';
    if (status !== undefined && status >= 500) return 'server';
    if (isRecord(error) && error.isAxiosError === true && !error.response) return 'transport';
    return 'other';
};

export const getApiErrorMessage = (error: unknown): ApiErrorMessage => {
    const kind = getApiErrorKind(error);
    if (kind === 'forbidden') return 'Acceso denegado. No tienes permiso para realizar esta operación.';
    if (kind === 'unauthenticated') return 'No autenticado. Inicia sesión para continuar.';
    if (kind === 'transport') return 'No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.';
    if (kind === 'server') return 'Error del servidor. No se pudo completar la solicitud. Inténtalo más tarde.';
    if (getApiErrorStatus(error) === 404) return 'Recurso no encontrado. Puede haber sido eliminado o no estar disponible.';
    // Also support callers that still hold an AxiosError rather than its body.
    if (isRecord(error) && isRecord(error.response)) return getApiErrorMessage(error.response.data);
    if (isRecord(error)) {
        const details = error.error ?? error.errors;
        if (typeof details === 'string' && details.trim()) return details;
        if (isRecord(details) && Object.keys(details).length > 0) {
            const fields: Record<string, string[]> = {};
            for (const [key, value] of Object.entries(details)) {
                if (typeof value === 'string') fields[key] = [value];
                else if (Array.isArray(value) && value.every(item => typeof item === 'string')) fields[key] = value;
            }
            if (Object.keys(fields).length > 0) return fields;
        }
        if (!(error instanceof Error) && typeof error.message === 'string' && error.message.trim()) return error.message;
    }
    return fallbackMessage;
};

export const getApiErrorText = (error: unknown): string => {
    const message = getApiErrorMessage(error);
    return typeof message === 'string' ? message : Object.values(message).flat().join(' ') || fallbackMessage;
};
