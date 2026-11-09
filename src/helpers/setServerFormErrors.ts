import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form';
import { getApiErrorMessage } from '../api/apiErrors';

export const setServerFormErrors = <T extends FieldValues>(
    error: unknown, setError: UseFormSetError<T>, allowedFields: readonly FieldPath<T>[],
) => {
    const message = getApiErrorMessage(error);
    // Keep every message visible, including unknown keys; never register unknown paths.
    setError('root.server', { type: 'server', message: typeof message === 'string'
        ? message : Object.values(message).flat().join(' ') });
    if (typeof message === 'string') return;
    for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(message, field)) {
            setError(field, { type: 'server', message: message[field].join(' ') });
        }
    }
};
