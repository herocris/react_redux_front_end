import { useQuery } from '@tanstack/react-query';
import { permissionOptionsOptions } from './permissionQueries';

export const usePermissionOptions = () => {
    const query = useQuery(permissionOptionsOptions());
    return {
        permisos: (query.data ?? []).map(({ id, nombre }) => ({ value: id, description: nombre })),
        permissionOptionsQuery: query,
    };
};
