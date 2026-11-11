import type { ListParams } from '../../../api/catalog';
import { queryOptions, type QueryClient } from '@tanstack/react-query';
import { getSessionSignal } from '../../../api/sessionScope';
import { sessionMutationOptions } from '../../../queries/sessionMutationOptions';
import { drugService } from '../services/drugService';
import type { Drug } from '../types';

export const drugKeys = {
    all: ['drug'] as const,
    lists: () => [...drugKeys.all, 'list'] as const,
    list: (params: ListParams) => [...drugKeys.lists(), params] as const,
    options: () => [...drugKeys.all, 'options'] as const,
};

export const drugListOptions = (params: ListParams) => queryOptions({
    queryKey: drugKeys.list(params),
    queryFn: ({ signal }) => drugService.list(params, signal),
});

export const drugOptionsOptions = () => queryOptions({
    queryKey: drugKeys.options(),
    queryFn: ({ signal }) => drugService.catalog(signal),
});

type DrugWrite =
    | { type: 'create'; values: Drug }
    | { type: 'update'; values: Drug & { id: number } }
    | { type: 'delete'; id: number };

// Construct in the authenticated consumer; all effects belong to guarded callbacks.
export const drugMutationOptions = (client: QueryClient, onSuccess: () => void) => {
    const signal = getSessionSignal();
    return sessionMutationOptions({
        mutationFn: async (write: DrugWrite) => {
            switch (write.type) {
                case 'create': return drugService.create(write.values, signal);
                case 'update': return drugService.update(write.values, signal);
                case 'delete': return drugService.remove(write.id, signal);
            }
        },
        onSuccess: async () => {
            await client.invalidateQueries({ queryKey: drugKeys.all });
            // The refetch can outlive this session too.
            if (!signal.aborted) onSuccess();
        },
    });
};
