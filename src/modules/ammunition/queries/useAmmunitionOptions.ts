import { useQuery } from '@tanstack/react-query';
import { ammunitionOptionsOptions } from './ammunitionQueries';
export const useAmmunitionOptions = () => {
    const query = useQuery(ammunitionOptionsOptions());
    return { options: (query.data ?? []).map(row => ({ value: row.id, description: row.descripcion })), query };
};
