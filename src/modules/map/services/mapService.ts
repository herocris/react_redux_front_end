import api from '../../../api/graphdataApi';
import type { AppliedAnalysisFilters } from '../../analysisFilters/types';
import type { MapItem } from '../types';

export const getMapItems = async (filters: AppliedAnalysisFilters, signal?: AbortSignal): Promise<MapItem[]> => {
    const { start_date, end_date, drugs, weapons, ammunitions } = filters;
    const { data } = await api.get<{ mapItems: MapItem[] }>('confiscation/map', {
        params: { start_date, end_date, drugs: `[${drugs}]`, weapons: `[${weapons}]`, ammunitions: `[${ammunitions}]` }, signal,
    });
    return data.mapItems;
};
