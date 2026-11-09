import { useQuery } from '@tanstack/react-query';
import { weaponOptionsOptions } from './weaponQueries';
export const useWeaponOptions = () => {
    const query = useQuery(weaponOptionsOptions());
    return { options: (query.data ?? []).map(row => ({ value: row.id, description: row.descripcion })), query };
};
