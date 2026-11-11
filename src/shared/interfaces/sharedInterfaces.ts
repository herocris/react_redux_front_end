export interface link {
    active: boolean,
    label: string,
    url: string

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
