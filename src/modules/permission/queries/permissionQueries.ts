import { queryOptions, type QueryClient } from '@tanstack/react-query';
import { getSessionSignal } from '../../../api/sessionScope';
import { sessionMutationOptions } from '../../../queries/sessionMutationOptions';
import { permissionService } from '../services/permissionService';
import type { Permission, PermissionListParams } from '../types';

export const permissionKeys = {
    all: ['permission'] as const,
    lists: () => [...permissionKeys.all, 'list'] as const,
    list: (params: PermissionListParams) => [...permissionKeys.lists(), params] as const,
    options: () => [...permissionKeys.all, 'options'] as const,
};

export const permissionListOptions = (params: PermissionListParams) => queryOptions({
    queryKey: permissionKeys.list(params),
    queryFn: ({ signal }) => permissionService.list(params, signal),
});

export const permissionOptionsOptions = () => queryOptions({
    queryKey: permissionKeys.options(),
    queryFn: ({ signal }) => permissionService.catalog(signal),
});

type PermissionWrite =
    | { type: 'create'; values: Permission }
    | { type: 'update'; values: Permission & { id: string } }
    | { type: 'delete'; id: string };

// Construct in the authenticated consumer; all effects belong to guarded callbacks.
export const permissionMutationOptions = (client: QueryClient, onSuccess: () => void) => {
    const signal = getSessionSignal();
    return sessionMutationOptions({
        mutationFn: async (write: PermissionWrite) => {
            switch (write.type) {
                case 'create': return permissionService.create(write.values, signal);
                case 'update': return permissionService.update(write.values, signal);
                case 'delete': return permissionService.remove(write.id, signal);
            }
        },
        onSuccess: async () => {
            await client.invalidateQueries({ queryKey: permissionKeys.all });
            // The refetch can outlive this session too.
            if (!signal.aborted) onSuccess();
        },
    });
};
