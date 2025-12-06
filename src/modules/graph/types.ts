import { SelectOptions } from "../../shared/interfaces/sharedInterfaces";

export interface BarLineGraph {
    name: string | number;
    [drugName: string]: string | number;
}
export interface PieGraph {
    name: string;
    value: number;
}
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
    drugCollection: SelectOptions[]
    weaponCollection: SelectOptions[]
    ammunitionCollection: SelectOptions[]
    setGraphType: Function
    getGraphData: Function
}

export interface BarGraphProps {
    data: any[]
}

export interface LineGraphProps {
    data: any[]
}