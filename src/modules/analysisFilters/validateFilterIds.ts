import { readId } from '../../api/identifiers';
import type { AppliedAnalysisFilters } from './types';

export const validateFilterIds = (filters: AppliedAnalysisFilters): AppliedAnalysisFilters => {
    for (const ids of [filters.drugs, filters.weapons, filters.ammunitions]) ids.forEach(readId);
    return filters;
};
