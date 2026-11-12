import { getEnvVariables } from './getEnvVariables';

// Resolve only for display. Keep the stored reference unchanged in forms/services.
export const getMediaUrl = (reference: unknown, base: unknown = getEnvVariables().VITE_LOCAL_PHOTOS_URL): string | undefined => {
    if (typeof reference !== 'string' || !reference.trim()) return undefined;
    try {
        const value = reference.trim();
        const url = /^https?:\/\//i.test(value)
            ? new URL(value)
            : typeof base === 'string' && base.trim()
                ? new URL(value, base.trim().replace(/\/+$/, '') + '/')
                : undefined;
        return url && ['http:', 'https:'].includes(url.protocol) ? url.href : undefined;
    } catch {
        return undefined;
    }
};
