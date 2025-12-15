import { SelectOptions } from "../../shared/interfaces/sharedInterfaces";
import { AmmunitionConfiscation } from "../ammunitionConfiscation";
import { DrugConfiscation } from "../drugConfiscation";
import { WeaponConfiscation } from "../weaponConfiscation";

export interface MapItem {
    id:number
    observacion:string
    latitud: number;
    longitud: number;
    drug_confiscations:DrugConfiscation[]
    weapon_confiscations:WeaponConfiscation[]
    ammunition_confiscations:AmmunitionConfiscation[]
}
export interface MapState {
    Mapitems: MapItem[]
    loading: boolean
    errorMessage: object
}

export interface MapForm {
    start_date: string;
    end_date: string;
    drugs: number[];
    weapons: number[];
    ammunitions: number[];
}

export interface CardMarkerContentProps {
    itemSubConfiscation: DrugConfiscation | WeaponConfiscation | AmmunitionConfiscation
}

export interface FormGraphProps {
    drugCollection: SelectOptions[]
    weaponCollection: SelectOptions[]
    ammunitionCollection: SelectOptions[]
    setMapType: Function
    getMapData: Function
}

export interface MapComponentProps {
  Mapitems: MapItem[]
  typeMap: string
  heightMap?: string
}

export interface MarkerContentProps {
    marker: MapItem
}