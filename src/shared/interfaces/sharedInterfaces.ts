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
export type LoadEntities = (
    page: number, sortBy: string, sortType: string, pageSize: number,
    filterField: string, filterValue: string, signal?: AbortSignal
) => void | Promise<void>;

export interface EntityListProps {
    handleOpen: (open: boolean) => void
    handleOpenDialog: () => void
    LoadingEntities: LoadEntities
    setIdEntity: (id: string, action: 'editar' | 'borrar') => void
    EntityCollection: { id?: string; name?: string; nombre?: string }[]
    tableOptions: TableOptions
    loading: boolean
    columnsTable: string[],
    editable?: boolean
}

export interface AlertDialogProps {
    DeleteEntity: () => void | Promise<void>
    handleOpen: () => void
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

export interface UserValidationsField {
    nombreValid: string,
    correoValid: string,
    passwordValid: string,
}
