import type { ListParams } from '../../../api/catalog';
import { queryOptions, type QueryClient } from '@tanstack/react-query';
import { getSessionSignal } from '../../../api/sessionScope';
import { sessionMutationOptions } from '../../../queries/sessionMutationOptions';
import { ammunitionService } from '../services/ammunitionService';
import type { Ammunition } from '../types';

export const ammunitionKeys = {
    all: ['ammunition'] as const,
    lists: () => [...ammunitionKeys.all, 'list'] as const,
    list: (params: ListParams) => [...ammunitionKeys.lists(), params] as const,
    options: () => [...ammunitionKeys.all, 'options'] as const,
};

export const ammunitionListOptions = (params: ListParams) => queryOptions({
    queryKey: ammunitionKeys.list(params),
    queryFn: ({ signal }) => ammunitionService.list(params, signal),
});

export const ammunitionOptionsOptions = () => queryOptions({
    queryKey: ammunitionKeys.options(),
    queryFn: ({ signal }) => ammunitionService.catalog(signal),
});

type AmmunitionWrite =
    | { type: 'create'; values: Ammunition }
    | { type: 'update'; values: Ammunition & { id: string } }
    | { type: 'delete'; id: string };

// Construct in the authenticated consumer; all effects belong to guarded callbacks.
export const ammunitionMutationOptions = (client: QueryClient, onSuccess: () => void) => {
    const signal = getSessionSignal();
    return sessionMutationOptions({
        mutationFn: async (write: AmmunitionWrite) => {
            switch (write.type) {
                case 'create': return ammunitionService.create(write.values, signal);
                case 'update': return ammunitionService.update(write.values, signal);
                case 'delete': return ammunitionService.remove(write.id, signal);
            }
        },
        onSuccess: async () => {
            await client.invalidateQueries({ queryKey: ammunitionKeys.all });
            // The refetch can outlive this session too.
            if (!signal.aborted) onSuccess();
        },
    });
};
