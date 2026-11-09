import { useQuery } from '@tanstack/react-query';
import { drugOptionsOptions } from './drugQueries';
export const useDrugOptions = () => {
    const query = useQuery(drugOptionsOptions());
    return { options: (query.data ?? []).map(row => ({ value: row.id, description: row.descripcion })), query };
};
