import { Control, FieldValues } from "react-hook-form";


export interface link {
    active: boolean,
    label: string,
    url: string

}









export interface ConfiscationFormProps {
    open: boolean;
    handleOpen: Function;
    loading: boolean
    //activeConfiscation: Confiscation
    //onSaveOrUptdate: Function
    modalTitle: string
    titleFormModal: Function
    errorMessage: object | string
}

export interface TableOptions {
    current_page: number,
    first_page_url: string,
    from: number,
    last_page: number,
    last_page_url: string,
    links: link[],
    next_page_url: string,
    path: string,
    per_page: number,
    prev_page_url: string,
    to: number,
    total: number
    orderBy: string,
    order: string,
    filterValue: string
}
export interface EntityListProps {
    handleOpen: Function
    handleOpenDialog: Function
    LoadingEntities: Function
    setIdEntity: Function
    EntityCollection: Object[]
    tableOptions: TableOptions
    loading: boolean
    columnsTable: string[],
    editable?: boolean
}



export interface useEntityListProps {
    handleOpen: Function
    handleOpenDialog: Function
    setIdEntity: Function
    columnsTable: string[]
    LoadingEntities: Function,
    editable: boolean,
    tableOptions: TableOptions
}

export interface PhotoInputProps {
    setValueFile: Function,
    control: Control<FieldValues>
}
export interface PhotoInput2Props {
    initFormValues: any,
    register: any
    PhotoRemove: any
    setPhoto: any
}




export interface AlertDialogProps {
    DeleteEntity: Function
    handleOpen: Function
    title: string
    dialogMessage: string
}


export interface SelectOptions {
    value: number,
    description: string,
}

export interface SelectResourceState {
    label: string
    value: string
}



export interface MultipleSelectButtonProps {
    optionValues: string[];
    onSelectMultipleValues: Function;
    rolesvalues: Object;
    nameSelect: string;
}




export interface UserValidationsField {
    nombreValid: string,
    correoValid: string,
    passwordValid: string,
}























export interface FileUploadFieldProps {
    name: string;
    control: any;
    label?: string;
    accept?: string;
    multiple?: boolean
}








