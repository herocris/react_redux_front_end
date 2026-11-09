import type { ListParams } from '../../../api/catalog';
import { queryOptions, type QueryClient } from '@tanstack/react-query';
import { getSessionSignal } from '../../../api/sessionScope';
import { sessionMutationOptions } from '../../../queries/sessionMutationOptions';
import { drugPresentationService } from '../services/drugPresentationService';
import type { DrugPresentation } from '../types';

export const drugPresentationKeys = {
    all: ['drugPresentation'] as const,
    lists: () => [...drugPresentationKeys.all, 'list'] as const,
    list: (params: ListParams) => [...drugPresentationKeys.lists(), params] as const,
    options: () => [...drugPresentationKeys.all, 'options'] as const,
};

export const drugPresentationListOptions = (params: ListParams) => queryOptions({
    queryKey: drugPresentationKeys.list(params),
    queryFn: ({ signal }) => drugPresentationService.list(params, signal),
});

export const drugPresentationOptionsOptions = () => queryOptions({
    queryKey: drugPresentationKeys.options(),
    queryFn: ({ signal }) => drugPresentationService.catalog(signal),
});

type DrugPresentationWrite =
    | { type: 'create'; values: DrugPresentation }
    | { type: 'update'; values: DrugPresentation & { id: string } }
    | { type: 'delete'; id: string };

// Construct in the authenticated consumer; all effects belong to guarded callbacks.
export const drugPresentationMutationOptions = (client: QueryClient, onSuccess: () => void) => {
    const signal = getSessionSignal();
    return sessionMutationOptions({
        mutationFn: async (write: DrugPresentationWrite) => {
            switch (write.type) {
                case 'create': return drugPresentationService.create(write.values, signal);
                case 'update': return drugPresentationService.update(write.values, signal);
                case 'delete': return drugPresentationService.remove(write.id, signal);
            }
        },
        onSuccess: async () => {
            await client.invalidateQueries({ queryKey: drugPresentationKeys.all });
            // The refetch can outlive this session too.
            if (!signal.aborted) onSuccess();
        },
    });
};
