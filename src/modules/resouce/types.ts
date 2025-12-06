import { SelectOptions } from "../../shared/interfaces/sharedInterfaces";

export interface ResourceState {
    rolesCollection: SelectOptions[],
    permisosCollection: SelectOptions[],
    drugCollection: SelectOptions[],
    drugPresentationCollection: SelectOptions[],
    weaponCollection: SelectOptions[],
    ammunitionCollection: SelectOptions[],
    loading: boolean
}