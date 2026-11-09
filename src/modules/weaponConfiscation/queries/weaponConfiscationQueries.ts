import { queryOptions, type QueryClient } from '@tanstack/react-query';
import type { ListParams } from '../../../api/catalog';
import { getSessionSignal } from '../../../api/sessionScope';
import { sessionMutationOptions } from '../../../queries/sessionMutationOptions';
import { confiscationKeys } from '../../confiscation/queries/confiscationQueries';
import { weaponConfiscationService } from '../services/weaponConfiscationService';
import type { WeaponConfiscation } from '../types';
import { invalidateAnalysis } from '../../analysisFilters/invalidateAnalysis';

export const weaponConfiscationKeys = {
    all: ['weaponConfiscation'] as const,
    parent: (parent: string) => ['weaponConfiscation', parent] as const,
    list: (parent: string, params: ListParams) => [...weaponConfiscationKeys.parent(parent), 'list', params] as const,
};
export const weaponConfiscationListOptions = (parent: string, params: ListParams) => queryOptions({
    queryKey: weaponConfiscationKeys.list(parent, params),
    queryFn: ({ signal }) => weaponConfiscationService.list(parent, params, signal),
    enabled: !!parent,
});
type Write = { type: 'create'; values: WeaponConfiscation } |
    { type: 'update'; values: WeaponConfiscation & { identificador: string } } | { type: 'delete'; id: string };
export const weaponConfiscationMutationOptions = (client: QueryClient, parent: string, onSuccess: () => void) => {
    const signal = getSessionSignal();
    return sessionMutationOptions({
        mutationFn: async (write: Write) => {
            switch (write.type) {
                case 'create': return weaponConfiscationService.create(write.values, signal);
                case 'update': return weaponConfiscationService.update(write.values, signal);
                case 'delete': return weaponConfiscationService.remove(write.id, signal);
            }
        },
        onSuccess: async () => {
            await Promise.all([
                invalidateAnalysis(client),
                client.invalidateQueries({ queryKey: weaponConfiscationKeys.parent(parent) }),
                client.invalidateQueries({ queryKey: confiscationKeys.detail(parent) }),
                client.invalidateQueries({ queryKey: confiscationKeys.lists() }),
            ]);
            if (!signal.aborted) onSuccess();
        },
    });
};
