import { readId } from '../../../api/identifiers';
import { queryOptions, type QueryClient } from '@tanstack/react-query';
import type { ListParams } from '../../../api/catalog';
import { getSessionSignal } from '../../../api/sessionScope';
import { sessionMutationOptions } from '../../../queries/sessionMutationOptions';
import { confiscationService, type ConfiscationEntity } from '../services/confiscationService';
import type { Confiscation } from '../types';
import { invalidateAnalysis } from '../../analysisFilters/invalidateAnalysis';

export const confiscationKeys = {
    all: ['confiscation'] as const,
    lists: () => ['confiscation', 'list'] as const,
    list: (params: ListParams) => [...confiscationKeys.lists(), params] as const,
    detail: (id: number) => ['confiscation', 'detail', readId(id)] as const,
};
export const confiscationListOptions = (params: ListParams) => queryOptions({
    queryKey: confiscationKeys.list(params),
    queryFn: ({ signal }) => confiscationService.list(params, signal),
});
export const confiscationDetailOptions = (id: number) => queryOptions({
    queryKey: confiscationKeys.detail(id),
    queryFn: ({ signal }) => confiscationService.detail(id, signal),
    enabled: !!id,
});
type Write = { type: 'create'; values: Confiscation } |
    { type: 'update'; values: ConfiscationEntity } | { type: 'delete'; id: number };
export const confiscationMutationOptions = (client: QueryClient,
    onSuccess: (data: ConfiscationEntity | void, write: Write) => void) => {
    const signal = getSessionSignal();
    return sessionMutationOptions({
        mutationFn: async (write: Write) => {
            switch (write.type) {
                case 'create': return confiscationService.create(write.values, signal);
                case 'update': return confiscationService.update(write.values, signal);
                case 'delete': return confiscationService.remove(write.id, signal);
            }
        },
        onSuccess: async (data, write) => {
            await Promise.all([
                client.invalidateQueries({ queryKey: confiscationKeys.all }),
                invalidateAnalysis(client),
            ]);
            if (signal.aborted) return;
            if (write.type === 'delete') {
                // Children of a removed parent cannot remain reusable.
                for (const domain of ['drugConfiscation', 'weaponConfiscation', 'ammunitionConfiscation']) {
                    await client.cancelQueries({ queryKey: [domain, write.id] });
                    if (signal.aborted) return;
                    client.removeQueries({ queryKey: [domain, write.id] });
                }
                client.removeQueries({ queryKey: confiscationKeys.detail(write.id), exact: true });
            }
            if (!signal.aborted) onSuccess(data, write);
        },
    });
};
