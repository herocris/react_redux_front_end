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
export interface GraphState {
    barLineGraph: BarLineGraph[]
    pieGraph: PieGraph[]
    loading: boolean
    errorMessage: object
}

export interface DrugGraphForm {
    period: number;
    start_date: string;
    end_date: string;
    drugs: number[];
    typeGraph: string
}
export interface WeaponGraphForm {
    period: number;
    start_date: string;
    end_date: string;
    weapons: number[];
    typeGraph: string
}
export interface AmmunitionGraphForm {
    period: number;
    start_date: string;
    end_date: string;
    ammunitions: number[];
    typeGraph: string
}
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
