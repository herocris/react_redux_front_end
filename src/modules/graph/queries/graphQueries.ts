import { validateFilterIds } from '../../analysisFilters/validateFilterIds';
import { queryOptions } from '@tanstack/react-query';
import type { GraphArguments } from '../types';
import { getGraphData } from '../services/graphService';

export const graphKeys = {
    analyses: () => ['graph', 'analysis'] as const,
    analysis: (args: GraphArguments) => [...graphKeys.analyses(), { ...args, filters: validateFilterIds(args.filters) }] as const,
};
export const graphQueryOptions = (args: GraphArguments) => queryOptions({
    queryKey: graphKeys.analysis(args),
    queryFn: ({ signal }) => getGraphData(args, signal),
    enabled: !!args.filters.start_date && !!args.filters.end_date &&
        args.filters[args.typeConfiscation === 'Drogas' ? 'drugs' : args.typeConfiscation === 'Armas' ? 'weapons' : 'ammunitions'].length > 0,
});
