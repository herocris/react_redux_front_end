import type { ListParams } from '../../../api/catalog';
import { queryOptions, type QueryClient } from '@tanstack/react-query';
import { getSessionSignal } from '../../../api/sessionScope';
import { sessionMutationOptions } from '../../../queries/sessionMutationOptions';
import { roleService } from '../services/roleService';
import type { Role } from '../types';

export const roleKeys = {
    all: ['role'] as const,
    lists: () => [...roleKeys.all, 'list'] as const,
    list: (params: ListParams) => [...roleKeys.lists(), params] as const,
    options: () => [...roleKeys.all, 'options'] as const,
};

export const roleListOptions = (params: ListParams) => queryOptions({
    queryKey: roleKeys.list(params),
    queryFn: ({ signal }) => roleService.list(params, signal),
});

export const roleOptionsOptions = () => queryOptions({
    queryKey: roleKeys.options(),
    queryFn: ({ signal }) => roleService.catalog(signal),
});

type RoleWrite =
    | { type: 'create'; values: Role }
    | { type: 'update'; values: Role & { id: string } }
    | { type: 'delete'; id: string };

// Construct in the authenticated consumer; all effects belong to guarded callbacks.
export const roleMutationOptions = (client: QueryClient, onSuccess: () => void) => {
    const signal = getSessionSignal();
    return sessionMutationOptions({
        mutationFn: async (write: RoleWrite) => {
            switch (write.type) {
                case 'create': return roleService.create(write.values, signal);
                case 'update': return roleService.update(write.values, signal);
                case 'delete': return roleService.remove(write.id, signal);
            }
        },
        onSuccess: async () => {
            await client.invalidateQueries({ queryKey: roleKeys.all });
            // The refetch can outlive this session too.
            if (!signal.aborted) onSuccess();
        },
    });
};
