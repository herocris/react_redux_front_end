import type { ApiErrorMessage } from '../../api/apiErrors';
import { TableOptions } from "../../shared/interfaces/sharedInterfaces"

export interface DrugPresentation {
    id?: number,
    identificador?: number,
    descripcion: string,
    logo: string | File
}


export interface DrugPresentationFormModalProps {
    handleOpen: (open: boolean) => void;
    loading: boolean
    activeDrugPresentation: DrugPresentation
    onSaveOrUptdate: (values: DrugPresentation) => Promise<void>
    errorMessage: ApiErrorMessage
}
export type DrugPresentationResponse = Omit<DrugPresentation, 'id' | 'identificador' | 'logo'> & {
    identificador: number;
    logo: string;
};

export type DrugPresentationListResponse = TableOptions & { data: DrugPresentationResponse[] };

export type DrugPresentationEntity = Omit<DrugPresentationResponse, 'identificador'> & { id: number };
