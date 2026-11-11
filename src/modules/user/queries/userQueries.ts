import type { ListParams } from '../../../api/catalog';
import { queryOptions, type QueryClient } from '@tanstack/react-query';
import { getSessionSignal } from '../../../api/sessionScope';
import { sessionMutationOptions } from '../../../queries/sessionMutationOptions';
import { userService } from '../services/userService';
import type { User } from '../types';

export const userKeys = {
    all: ['user'] as const,
    lists: () => [...userKeys.all, 'list'] as const,
    list: (params: ListParams) => [...userKeys.lists(), params] as const,
    options: () => [...userKeys.all, 'options'] as const,
};

export const userListOptions = (params: ListParams) => queryOptions({
    queryKey: userKeys.list(params),
    queryFn: ({ signal }) => userService.list(params, signal),
});

export const userOptionsOptions = () => queryOptions({
    queryKey: userKeys.options(),
    queryFn: ({ signal }) => userService.catalog(signal),
});

type UserWrite =
    | { type: 'create'; values: User }
    | { type: 'update'; values: User & { id: number } }
    | { type: 'delete'; id: number };

// Construct in the authenticated consumer; all effects belong to guarded callbacks.
export const userMutationOptions = (client: QueryClient, onSuccess: () => void) => {
    const signal = getSessionSignal();
    return sessionMutationOptions({
        mutationFn: async (write: UserWrite) => {
            switch (write.type) {
                case 'create': return userService.create(write.values, signal);
                case 'update': return userService.update(write.values, signal);
                case 'delete': return userService.remove(write.id, signal);
            }
        },
        onSuccess: async () => {
            await client.invalidateQueries({ queryKey: userKeys.all });
            // The refetch can outlive this session too.
            if (!signal.aborted) onSuccess();
        },
    });
};
