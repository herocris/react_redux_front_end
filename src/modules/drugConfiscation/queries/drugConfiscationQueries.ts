import { readId } from '../../../api/identifiers';
import { queryOptions, type QueryClient } from '@tanstack/react-query';
import type { ListParams } from '../../../api/catalog';
import { getSessionSignal } from '../../../api/sessionScope';
import { sessionMutationOptions } from '../../../queries/sessionMutationOptions';
import { confiscationKeys } from '../../confiscation/queries/confiscationQueries';
import { drugConfiscationService } from '../services/drugConfiscationService';
import type { DrugConfiscation } from '../types';
import { invalidateAnalysis } from '../../analysisFilters/invalidateAnalysis';

export const drugConfiscationKeys = {
    all: ['drugConfiscation'] as const,
    parent: (parent: number) => ['drugConfiscation', readId(parent)] as const,
    list: (parent: number, params: ListParams) => [...drugConfiscationKeys.parent(parent), 'list', params] as const,
};
export const drugConfiscationListOptions = (parent: number, params: ListParams) => queryOptions({
    queryKey: drugConfiscationKeys.list(parent, params),
    queryFn: ({ signal }) => drugConfiscationService.list(parent, params, signal),
    enabled: !!parent,
});
type Write = { type: 'create'; values: DrugConfiscation } |
    { type: 'update'; values: DrugConfiscation & { identificador: number } } | { type: 'delete'; id: number };
export const drugConfiscationMutationOptions = (client: QueryClient, parent: number, onSuccess: () => void) => {
    const signal = getSessionSignal();
    return sessionMutationOptions({
        mutationFn: async (write: Write) => {
            switch (write.type) {
                case 'create': return drugConfiscationService.create(write.values, signal);
                case 'update': return drugConfiscationService.update(write.values, signal);
                case 'delete': return drugConfiscationService.remove(write.id, signal);
            }
        },
        onSuccess: async () => {
            await Promise.all([
                invalidateAnalysis(client),
                client.invalidateQueries({ queryKey: drugConfiscationKeys.parent(parent) }),
                client.invalidateQueries({ queryKey: confiscationKeys.detail(parent) }),
                client.invalidateQueries({ queryKey: confiscationKeys.lists() }),
            ]);
            if (!signal.aborted) onSuccess();
        },
    });
};
