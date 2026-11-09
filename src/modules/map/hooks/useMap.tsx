import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '../../../hooks/hooks';
import { selectAppliedAnalysisFilters } from '../../analysisFilters/slices/analysisFiltersSlice';
import { combineOptionsStatus } from '../../resouce/queries/optionsStatus';
import { useAmmunitionOptions } from '../../ammunition/queries/useAmmunitionOptions';
import { useWeaponOptions } from '../../weapon/queries/useWeaponOptions';
import { useDrugOptions } from '../../drug/queries/useDrugOptions';
import { mapQueryOptions } from '../queries/mapQueries';

export const useMap = () => {
    const filters = useAppSelector(selectAppliedAnalysisFilters);
    const [typeMap, setMapType] = useState('location');
    const options = mapQueryOptions(filters);
    const query = useQuery(options);
    const { options: drugCollection, query: drugQuery } = useDrugOptions();
    const { options: weaponCollection, query: weaponQuery } = useWeaponOptions();
    const { options: ammunitionCollection, query: ammunitionQuery } = useAmmunitionOptions();
    const optionsStatus = combineOptionsStatus(drugQuery, weaponQuery, ammunitionQuery);
    return { optionsStatus, drugCollection, weaponCollection, ammunitionCollection,
        typeMap, setMapType, initialFilters: filters, query, enabled: options.enabled,
        Mapitems: query.data ?? [] };
};
