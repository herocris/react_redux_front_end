import { useQuery } from '@tanstack/react-query';
import { userOptionsOptions } from './userQueries';
export const useUserOptions = () => {
    const query = useQuery(userOptionsOptions());
    return { options: (query.data ?? []).map(row => ({ value: row.id, description: row.nombre })), query };
};
