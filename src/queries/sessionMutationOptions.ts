import { CanceledError } from 'axios';
import type { MutationOptions } from '@tanstack/react-query';
import { getSessionSignal } from '../api/sessionScope';

// Create options in the authenticated consumer. Keep lifecycle effects here,
// rather than per-call mutate callbacks, so a retired session cannot run them.
export const sessionMutationOptions = <TData, TVariables, TContext = unknown>(
    options: MutationOptions<TData, unknown, TVariables, TContext> & {
        mutationFn: NonNullable<MutationOptions<TData, unknown, TVariables, TContext>['mutationFn']>;
    },
): MutationOptions<TData, unknown, TVariables, TContext> => {
    const signal = getSessionSignal();
    const assertCurrent = () => {
        if (signal.aborted) throw new CanceledError('La sesión ha cambiado.');
    };

    return {
        ...options,
        mutationFn: async (...args) => {
            assertCurrent();
            const data = await options.mutationFn(...args);
            assertCurrent();
            return data;
        },
        onMutate: options.onMutate ? (...args) => {
            assertCurrent();
            return options.onMutate!(...args);
        } : undefined,
        onSuccess: (...args) => {
            if (!signal.aborted) return options.onSuccess?.(...args);
        },
        onError: (...args) => {
            if (!signal.aborted) return options.onError?.(...args);
        },
        onSettled: (...args) => {
            if (!signal.aborted) return options.onSettled?.(...args);
        },
    };
};
