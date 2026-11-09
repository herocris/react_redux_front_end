import { useQuery } from '@tanstack/react-query';
import { roleOptionsOptions } from './roleQueries';
export const useRoleOptions = () => {
    const query = useQuery(roleOptionsOptions());
    return { options: (query.data ?? []).map(row => ({ value: row.id, description: row.nombre })), query };
};
