import type { ApiErrorMessage } from '../../api/apiErrors';
import { TableOptions } from "../../shared/interfaces/sharedInterfaces"

export interface Drug {
    id?: string,
    identificador?: string,
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
    identificador: string;
    logo: string;
};

export type DrugListResponse = TableOptions & { data: DrugResponse[] };

export type DrugEntity = Omit<DrugResponse, 'identificador'> & { id: string };
