import type { QueryClient } from '@tanstack/react-query';
import { mapKeys } from '../map/queries/mapQueries';
import { graphKeys } from '../graph/queries/graphQueries';

// Any change to a confiscation or its children can change counts and locations.
export const invalidateAnalysis = (client: QueryClient) => Promise.all([
    client.invalidateQueries({ queryKey: mapKeys.analyses() }),
    client.invalidateQueries({ queryKey: graphKeys.analyses() }),
]);
