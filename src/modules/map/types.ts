import type { OptionsStatus } from '../resouce/queries/optionsStatus';
import type { AppliedAnalysisFilters } from '../analysisFilters/types';
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
export interface CardMarkerContentProps {
    itemSubConfiscation: DrugConfiscation | WeaponConfiscation | AmmunitionConfiscation
}

export interface FormGraphProps {
    optionsStatus: OptionsStatus
    drugCollection: SelectOptions[]
    weaponCollection: SelectOptions[]
    ammunitionCollection: SelectOptions[]
    initialFilters: AppliedAnalysisFilters
    setMapType: (type: string) => void
}

export interface MapComponentProps {
  Mapitems: MapItem[]
  typeMap: string
  heightMap?: string
}

export interface MarkerContentProps {
    marker: MapItem
}
