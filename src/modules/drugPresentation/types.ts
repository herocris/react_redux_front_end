import type { ApiErrorMessage } from '../../api/apiErrors';
import { TableOptions } from "../../shared/interfaces/sharedInterfaces"

export interface DrugPresentation {
    id?: string,
    identificador?: string,
    descripcion: string,
    logo: string | File
}

export interface DrugPresentationState {
    drugPresentations: DrugPresentation[],
    activeDrugPresentation: DrugPresentation,
    tableOptions: TableOptions,
    loading: boolean
    errorMessage: ApiErrorMessage
}

export interface DrugPresentationFormModalProps {
    handleOpen: (open: boolean) => void;
    loading: boolean
    activeDrugPresentation: DrugPresentation
    onSaveOrUptdate: (values: DrugPresentation) => Promise<void>
    errorMessage: ApiErrorMessage
}
export type DrugPresentationResponse = Omit<DrugPresentation, 'id' | 'identificador' | 'logo'> & {
    identificador: string;
    logo: string;
};

export type DrugPresentationListResponse = TableOptions & { data: DrugPresentationResponse[] };
