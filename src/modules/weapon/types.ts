import type { ApiErrorMessage } from '../../api/apiErrors';
import { TableOptions } from "../../shared/interfaces/sharedInterfaces"

export interface Weapon {
    id?: string,
    identificador?: string,
    descripcion: string,
    logo: string | File
}

export interface WeaponState {
    weapons: Weapon[],
    activeWeapon: Weapon,
    tableOptions: TableOptions,
    loading: boolean
    errorMessage: ApiErrorMessage
}

export interface WeaponFormModalProps {
    handleOpen: (open: boolean) => void;
    loading: boolean
    activeWeapon: Weapon
    onSaveOrUptdate: (values: Weapon) => Promise<void>
    errorMessage: ApiErrorMessage
}
export type WeaponResponse = Omit<Weapon, 'id' | 'identificador' | 'logo'> & {
    identificador: string;
    logo: string;
};

export type WeaponListResponse = TableOptions & { data: WeaponResponse[] };
