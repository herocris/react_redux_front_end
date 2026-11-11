import type { ApiErrorMessage } from '../../api/apiErrors';
import { TableOptions } from "../../shared/interfaces/sharedInterfaces"

export interface Weapon {
    id?: number,
    identificador?: number,
    descripcion: string,
    logo: string | File
}


export interface WeaponFormModalProps {
    handleOpen: (open: boolean) => void;
    loading: boolean
    activeWeapon: Weapon
    onSaveOrUptdate: (values: Weapon) => Promise<void>
    errorMessage: ApiErrorMessage
}
export type WeaponResponse = Omit<Weapon, 'id' | 'identificador' | 'logo'> & {
    identificador: number;
    logo: string;
};

export type WeaponListResponse = TableOptions & { data: WeaponResponse[] };

export type WeaponEntity = Omit<WeaponResponse, 'identificador'> & { id: number };
