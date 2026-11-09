import type { ListParams } from '../../../api/catalog';
import { queryOptions, type QueryClient } from '@tanstack/react-query';
import { getSessionSignal } from '../../../api/sessionScope';
import { sessionMutationOptions } from '../../../queries/sessionMutationOptions';
import { weaponService } from '../services/weaponService';
import type { Weapon } from '../types';

export const weaponKeys = {
    all: ['weapon'] as const,
    lists: () => [...weaponKeys.all, 'list'] as const,
    list: (params: ListParams) => [...weaponKeys.lists(), params] as const,
    options: () => [...weaponKeys.all, 'options'] as const,
};

export const weaponListOptions = (params: ListParams) => queryOptions({
    queryKey: weaponKeys.list(params),
    queryFn: ({ signal }) => weaponService.list(params, signal),
});

export const weaponOptionsOptions = () => queryOptions({
    queryKey: weaponKeys.options(),
    queryFn: ({ signal }) => weaponService.catalog(signal),
});

type WeaponWrite =
    | { type: 'create'; values: Weapon }
    | { type: 'update'; values: Weapon & { id: string } }
    | { type: 'delete'; id: string };

// Construct in the authenticated consumer; all effects belong to guarded callbacks.
export const weaponMutationOptions = (client: QueryClient, onSuccess: () => void) => {
    const signal = getSessionSignal();
    return sessionMutationOptions({
        mutationFn: async (write: WeaponWrite) => {
            switch (write.type) {
                case 'create': return weaponService.create(write.values, signal);
                case 'update': return weaponService.update(write.values, signal);
                case 'delete': return weaponService.remove(write.id, signal);
            }
        },
        onSuccess: async () => {
            await client.invalidateQueries({ queryKey: weaponKeys.all });
            // The refetch can outlive this session too.
            if (!signal.aborted) onSuccess();
        },
    });
};
