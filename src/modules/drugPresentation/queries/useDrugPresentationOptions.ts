import { useQuery } from '@tanstack/react-query';
import { drugPresentationOptionsOptions } from './drugPresentationQueries';
export const useDrugPresentationOptions = () => {
    const query = useQuery(drugPresentationOptionsOptions());
    return { options: (query.data ?? []).map(row => ({ value: row.id, description: row.descripcion })), query };
};
