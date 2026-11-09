import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '../../../hooks/hooks';
import { selectAppliedAnalysisFilters } from '../../analysisFilters/slices/analysisFiltersSlice';
import { combineOptionsStatus } from '../../resouce/queries/optionsStatus';
import { useAmmunitionOptions } from '../../ammunition/queries/useAmmunitionOptions';
import { useWeaponOptions } from '../../weapon/queries/useWeaponOptions';
import { useDrugOptions } from '../../drug/queries/useDrugOptions';
import { graphQueryOptions } from '../queries/graphQueries';
import type { GraphArguments } from '../types';

export const useGraph = () => {
    const filters = useAppSelector(selectAppliedAnalysisFilters);
    const [typeGraph, setGraphType] = useState('bar');
    const [appliedControls, setAppliedControls] = useState<Omit<GraphArguments, 'filters'>>({
        period: 1, typeConfiscation: 'Drogas', typeGraph: 'bar',
    });
    const options = graphQueryOptions({ filters, ...appliedControls });
    const query = useQuery(options);
    const getGraphData = (data: Omit<GraphArguments, 'filters'>) => setAppliedControls({
        period: data.period, typeConfiscation: data.typeConfiscation, typeGraph: data.typeGraph,
    });
    const { options: drugCollection, query: drugQuery } = useDrugOptions();
    const { options: weaponCollection, query: weaponQuery } = useWeaponOptions();
    const { options: ammunitionCollection, query: ammunitionQuery } = useAmmunitionOptions();
    const optionsStatus = combineOptionsStatus(drugQuery, weaponQuery, ammunitionQuery);
    return { optionsStatus, drugCollection, weaponCollection, ammunitionCollection,
        typeGraph, setGraphType, getGraphData, initialFilters: filters, query, enabled: options.enabled,
        barLineGraph: query.data?.lineBarData ?? [], pieGraph: query.data?.pieData ?? [] };
};
