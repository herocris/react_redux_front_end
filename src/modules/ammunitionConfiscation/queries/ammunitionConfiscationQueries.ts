import { readId } from '../../../api/identifiers';
import { queryOptions, type QueryClient } from '@tanstack/react-query';
import type { ListParams } from '../../../api/catalog';
import { getSessionSignal } from '../../../api/sessionScope';
import { sessionMutationOptions } from '../../../queries/sessionMutationOptions';
import { confiscationKeys } from '../../confiscation/queries/confiscationQueries';
import { ammunitionConfiscationService } from '../services/ammunitionConfiscationService';
import type { AmmunitionConfiscation } from '../types';
import { invalidateAnalysis } from '../../analysisFilters/invalidateAnalysis';

export const ammunitionConfiscationKeys = {
    all: ['ammunitionConfiscation'] as const,
    parent: (parent: number) => ['ammunitionConfiscation', readId(parent)] as const,
    list: (parent: number, params: ListParams) => [...ammunitionConfiscationKeys.parent(parent), 'list', params] as const,
};
export const ammunitionConfiscationListOptions = (parent: number, params: ListParams) => queryOptions({
    queryKey: ammunitionConfiscationKeys.list(parent, params),
    queryFn: ({ signal }) => ammunitionConfiscationService.list(parent, params, signal),
    enabled: !!parent,
});
type Write = { type: 'create'; values: AmmunitionConfiscation } |
    { type: 'update'; values: AmmunitionConfiscation & { identificador: number } } | { type: 'delete'; id: number };
export const ammunitionConfiscationMutationOptions = (client: QueryClient, parent: number, onSuccess: () => void) => {
    const signal = getSessionSignal();
    return sessionMutationOptions({
        mutationFn: async (write: Write) => {
            switch (write.type) {
                case 'create': return ammunitionConfiscationService.create(write.values, signal);
                case 'update': return ammunitionConfiscationService.update(write.values, signal);
                case 'delete': return ammunitionConfiscationService.remove(write.id, signal);
            }
        },
        onSuccess: async () => {
            await Promise.all([
                invalidateAnalysis(client),
                client.invalidateQueries({ queryKey: ammunitionConfiscationKeys.parent(parent) }),
                client.invalidateQueries({ queryKey: confiscationKeys.detail(parent) }),
                client.invalidateQueries({ queryKey: confiscationKeys.lists() }),
            ]);
            if (!signal.aborted) onSuccess();
        },
    });
};
