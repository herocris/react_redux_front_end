import Box from '@mui/material/Box';
import { Grow } from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import type { DataGridProps, GridColDef, GridValidRowModel } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { esES } from '@mui/x-data-grid/locales';

export interface EntityListProps<Row extends GridValidRowModel> {
    rows: readonly Row[];
    columns: GridColDef<Row>[];
    loading: boolean;
    rowCount: number;
    paginationModel: NonNullable<DataGridProps<Row>['paginationModel']>;
    sortModel: NonNullable<DataGridProps<Row>['sortModel']>;
    filterModel: NonNullable<DataGridProps<Row>['filterModel']>;
    onPaginationModelChange: NonNullable<DataGridProps<Row>['onPaginationModelChange']>;
    onSortModelChange: NonNullable<DataGridProps<Row>['onSortModelChange']>;
    onFilterModelChange: NonNullable<DataGridProps<Row>['onFilterModelChange']>;
    onEdit?: (row: Row) => void;
    onDelete?: (row: Row) => void;
}

// The consumer owns models, requests and dialogs.
export function EntityList<Row extends GridValidRowModel>({
    columns, onEdit, onDelete, ...gridProps
}: EntityListProps<Row>) {
    const actionsColumn: GridColDef<Row> = {
        field: 'actions', type: 'actions', headerName: 'Acciones',
        getActions: ({ row }) => [
            ...(onEdit ? [<GridActionsCellItem key="edit" icon={<EditIcon />} label="Editar" onClick={() => onEdit(row)} color="inherit" />] : []),
            ...(onDelete ? [<GridActionsCellItem key="delete" icon={<DeleteIcon />} label="Borrar" onClick={() => onDelete(row)} color="inherit" />] : []),
        ],
    };

    return (
        <Grow in style={{ transformOrigin: '1 0 0' }} timeout={1000}>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', maxHeight: '100%' }}>
                <DataGrid<Row>
                    {...gridProps}
                    localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                    columns={onEdit || onDelete ? [...columns, actionsColumn] : columns}
                    density="compact"
                    pagination
                    sortingMode="server"
                    filterMode="server"
                    paginationMode="server"
                    pageSizeOptions={[5, 10, 25, 100]}
                />
            </Box>
        </Grow>
    );
}
