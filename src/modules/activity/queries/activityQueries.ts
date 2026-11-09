import { queryOptions } from '@tanstack/react-query';
import type { ListParams } from '../../../api/catalog';
import { activityService } from '../services/activityService';
export const activityKeys = {
    all: ['activity'] as const,
    list: (params: ListParams) => [...activityKeys.all, 'list', params] as const,
};
export const activityListOptions = (params: ListParams) => queryOptions({
    queryKey: activityKeys.list(params), queryFn: ({ signal }) => activityService.list(params, signal),
});
