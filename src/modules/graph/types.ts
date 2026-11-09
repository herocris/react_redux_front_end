import type { OptionsStatus } from '../resouce/queries/optionsStatus';
import type { AppliedAnalysisFilters } from '../analysisFilters/types';

export type GraphType = 'bar' | 'line' | 'pie';
export type ConfiscationType = 'Drogas' | 'Armas' | 'Municiones';
export interface GraphArguments {
    filters: AppliedAnalysisFilters;
    period: number;
    typeConfiscation: ConfiscationType;
    typeGraph: GraphType;
}
export interface GraphData { lineBarData: BarLineGraph[]; pieData: PieGraph[] }
import { SelectOptions } from "../../shared/interfaces/sharedInterfaces";

export interface BarLineGraph {
    name: string | number;
    [drugName: string]: string | number;
}
export type PieGraph = {
    name: string;
    value: number;
};
export interface FormGraphProps {
    optionsStatus: OptionsStatus
    drugCollection: SelectOptions[]
    weaponCollection: SelectOptions[]
    ammunitionCollection: SelectOptions[]
    initialFilters: AppliedAnalysisFilters
    setGraphType: (type: string) => void
    getGraphData: (data: { period: number; typeConfiscation: ConfiscationType; typeGraph: GraphType }) => void
}

export interface BarGraphProps {
    data: BarLineGraph[]
}

export interface LineGraphProps {
    data: BarLineGraph[]
}
