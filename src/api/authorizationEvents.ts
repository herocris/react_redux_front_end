// Transport notification only. Redux remains the only session owner.
const listeners = new Set<(signal: AbortSignal) => void>();
export const subscribeForbidden = (listener: (signal: AbortSignal) => void) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
};
export const notifyForbidden = (signal: AbortSignal) => {
    if (!signal.aborted) listeners.forEach(listener => listener(signal));
};
