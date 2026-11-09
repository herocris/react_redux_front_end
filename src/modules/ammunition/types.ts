import type { ApiErrorMessage } from '../../api/apiErrors';
import { TableOptions } from "../../shared/interfaces/sharedInterfaces"

export interface Ammunition {
    id?: string,
    identificador?: string,
    descripcion: string,
    logo: string | File
}


export interface AmmunitionFormModalProps {
    handleOpen: (open: boolean) => void;
    loading: boolean
    activeAmmunition: Ammunition
    onSaveOrUptdate: (values: Ammunition) => Promise<void>
    errorMessage: ApiErrorMessage
}
export type AmmunitionResponse = Omit<Ammunition, 'id' | 'identificador' | 'logo'> & {
    identificador: string;
    logo: string;
};

export type AmmunitionListResponse = TableOptions & { data: AmmunitionResponse[] };

export type AmmunitionEntity = Omit<AmmunitionResponse, 'identificador'> & { id: string };
