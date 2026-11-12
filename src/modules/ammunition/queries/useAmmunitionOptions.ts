import { useAccess } from '../../auth/hooks/useAccess';
import { useQuery } from '@tanstack/react-query';
import { ammunitionOptionsOptions } from './ammunitionQueries';
export const useAmmunitionOptions = (enabled = true) => {
    const access = useAccess('ammunition');
    const result = useQuery({ ...ammunitionOptionsOptions(), enabled: enabled && access.view });
    const query = { ...result, data: access.view ? result.data : undefined,
        refetch: () => enabled && access.view ? result.refetch() : Promise.resolve(result) };
    return { options: (query.data ?? []).map(row => ({ value: row.id, description: row.descripcion })), query };
};
