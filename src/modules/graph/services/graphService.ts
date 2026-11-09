import api from '../../../api/graphdataApi';
import type { GraphArguments, GraphData } from '../types';

const endpoints = { Drogas: ['drugGraphIndex', 'drugs'], Armas: ['weaponGraphIndex', 'weapons'], Municiones: ['ammunitionGraphIndex', 'ammunitions'] } as const;

export const getGraphData = async (args: GraphArguments, signal?: AbortSignal): Promise<GraphData> => {
    const { filters, period, typeConfiscation, typeGraph } = args;
    const [endpoint, field] = endpoints[typeConfiscation];
    const { data } = await api.get<GraphData>(endpoint, {
        params: { period: period === 1 ? 'month' : 'year', start_date: filters.start_date,
            end_date: filters.end_date, [field]: `[${filters[field]}]`, typeGraph }, signal,
    });
    return data;
};
