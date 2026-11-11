import type { ApiErrorMessage } from '../../api/apiErrors';
import { TableOptions } from "../../shared/interfaces/sharedInterfaces"

export interface Drug {
    id?: number,
    identificador?: number,
    descripcion: string,
    logo: string | File
}


export interface DrugFormModalProps {
    handleOpen: (open: boolean) => void;
    loading: boolean
    activeDrug: Drug
    onSaveOrUptdate: (values: Drug) => Promise<void>
    errorMessage: ApiErrorMessage
}
export type DrugResponse = Omit<Drug, 'id' | 'identificador' | 'logo'> & {
    identificador: number;
    logo: string;
};

export type DrugListResponse = TableOptions & { data: DrugResponse[] };

export type DrugEntity = Omit<DrugResponse, 'identificador'> & { id: number };
