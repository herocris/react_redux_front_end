import { useAccess } from '../../auth/hooks/useAccess';
import { useQuery } from '@tanstack/react-query';
import { drugPresentationOptionsOptions } from './drugPresentationQueries';
export const useDrugPresentationOptions = (enabled = true) => {
    const access = useAccess('drugPresentation');
    const result = useQuery({ ...drugPresentationOptionsOptions(), enabled: enabled && access.view });
    const query = { ...result, data: access.view ? result.data : undefined,
        refetch: () => enabled && access.view ? result.refetch() : Promise.resolve(result) };
    return { options: (query.data ?? []).map(row => ({ value: row.id, description: row.descripcion })), query };
};
