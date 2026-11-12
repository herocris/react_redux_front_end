import { useAccess } from '../../auth/hooks/useAccess';
import { useQuery } from '@tanstack/react-query';
import { permissionOptionsOptions } from './permissionQueries';

export const usePermissionOptions = (enabled = true) => {
    const access = useAccess('permission');
    const result = useQuery({ ...permissionOptionsOptions(), enabled: enabled && access.view });
    const query = { ...result, data: access.view ? result.data : undefined,
        refetch: () => enabled && access.view ? result.refetch() : Promise.resolve(result) };
    return {
        permisos: (query.data ?? []).map(({ id, nombre }) => ({ value: id, description: nombre })),
        permissionOptionsQuery: query,
    };
};
