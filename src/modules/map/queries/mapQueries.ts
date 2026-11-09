import { queryOptions } from '@tanstack/react-query';
import type { AppliedAnalysisFilters } from '../../analysisFilters/types';
import { getMapItems } from '../services/mapService';

export const mapKeys = {
    analyses: () => ['map', 'analysis'] as const,
    analysis: (filters: AppliedAnalysisFilters) => [...mapKeys.analyses(), filters] as const,
};
export const mapQueryOptions = (filters: AppliedAnalysisFilters) => queryOptions({
    queryKey: mapKeys.analysis(filters),
    queryFn: ({ signal }) => getMapItems(filters, signal),
    enabled: !!filters.start_date && !!filters.end_date,
});
