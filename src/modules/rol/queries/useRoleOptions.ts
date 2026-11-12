import { useAccess } from '../../auth/hooks/useAccess';
import { useQuery } from '@tanstack/react-query';
import { roleOptionsOptions } from './roleQueries';
export const useRoleOptions = (enabled = true) => {
    const access = useAccess('role');
    const result = useQuery({ ...roleOptionsOptions(), enabled: enabled && access.view });
    const query = { ...result, data: access.view ? result.data : undefined,
        refetch: () => enabled && access.view ? result.refetch() : Promise.resolve(result) };
    return { options: (query.data ?? []).map(row => ({ value: row.id, description: row.nombre })), query };
};
