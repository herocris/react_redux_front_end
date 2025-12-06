import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { GridColDef, GridActionsCellItem, GridRowId, GridFilterModel, GridPaginationModel, GridSortModel, GridRowParams, GridRenderCellParams, GridTreeNodeWithRender, GridSortDirection } from '@mui/x-data-grid';
import { Avatar, Box, Tooltip } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useEntityListProps } from '../shared/interfaces/sharedInterfaces';
import { getEnvVariables } from '../helpers/getEnvVariables';
//import { useLocation, useNavigate } from 'react-router';


export const useEntityList = ({ handleOpen, handleOpenDialog, setIdEntity, columnsTable, LoadingEntities, editable = true, tableOptions }: useEntityListProps) => {
    // const location = useLocation();
    // const navigate = useNavigate();
    const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
    const [sortModel, setSortModel] = useState<GridSortModel>([{field:tableOptions.orderBy,sort:tableOptions.order as GridSortDirection}]);
    const [paginationModel, setPaginationModel] = useState({
        page: tableOptions.current_page - 1,
        pageSize: tableOptions.per_page,
    });
    const handleEditClick = (id: GridRowId) => () => {
        setIdEntity(id as string,'editar')
        handleOpen(true);
    };

    const handleDeleteClick = (id: GridRowId) => () => {
        setIdEntity(id as string,'borrar')
        handleOpenDialog();
    };

    const setValuePaginationModel = useCallback((paginationModel: GridPaginationModel) => {
        setPaginationModel(paginationModel)
    }, []);

    const setValueSortModel = useCallback((sortModel: GridSortModel) => {
        setSortModel(sortModel)
    }, []);

    const setValueFilterModel = useCallback((filterModel: GridFilterModel) => {
        setFilterModel(filterModel)
    }, []);

    const { VITE_LOCAL_PHOTOS_URL } = getEnvVariables();

    useEffect(() => {
        LoadingEntities(paginationModel.page + 1, sortModel[0]?.field || 'identificador', sortModel[0]?.sort || 'asc', paginationModel.pageSize, filterModel.items[0]?.field || '', filterModel.items[0]?.value || '')
        console.log('cargando colección');
        //navigate(location.pathname, { replace: true })
    }, [paginationModel, sortModel, filterModel])
    
    

    

    const actionsColumn: GridColDef = {
        field: 'actions',
        type: 'actions',
        headerName: 'Actions',
        //width: 100,
        
        cellClassName: 'actions',
        getActions: ({ id }: GridRowParams) => [
            <GridActionsCellItem
                icon={
                    <Tooltip title="Edit">
                        <EditIcon />
                    </Tooltip>
                }
                label="Edit"
                className="textPrimary"
                onClick={handleEditClick(id)}
                color="inherit"
            />,
            <GridActionsCellItem
                icon={
                    <Tooltip title="Delete">
                        <DeleteIcon />
                    </Tooltip>
                }
                label="Delete"
                onClick={handleDeleteClick(id)}
                color="inherit"
            />,
        ],
    }

    const createImageColumn = (
        field: string,
        headerName: string,
        options?: Partial<GridColDef>
    ): GridColDef => {
        return {
            field,
            headerName,
            //width: 100,
            sortable: false,
            filterable: false,
            align: "center",
            headerAlign: "center",
            renderCell: (
                params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>
            ) => {
                const value = params.value;
                const name = params.row.name || params.row.nombre || "N/A";
                const imageUrl =
                    typeof value === "string" && value.length > 0
                        ? `${VITE_LOCAL_PHOTOS_URL}/${value}`
                        : undefined;
                return (
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        width="100%"
                    >
                        <Avatar
                            src={imageUrl}
                            alt={name}
                            sx={{
                                width: 40,
                                height: 40,
                                bgcolor: imageUrl ? "transparent" : "primary.main",
                            }}
                        >
                            {!imageUrl && name.charAt(0).toUpperCase()}
                        </Avatar>
                    </Box>
                );
            },
            ...options, // permite sobrescribir valores (ej: width, headerAlign, etc.)
        };
    };

    const simpleColumn = (field: string): GridColDef => {
        
        
        return {
            field: field,
            headerName: field,
            //width: field == 'id' ? 50 : 180,
            flex: 1,
            //display:'flex'
            
        }
    }


    const Columns: GridColDef[] =
        columnsTable.map((column: string) => {
            if (column === 'logo') {
                return createImageColumn(column, column)
            } else {
                return simpleColumn(column)
            }
        }
        )

    const TableColumns = editable ? [...Columns, actionsColumn] : Columns

    return {
        TableColumns,
        setValuePaginationModel,
        setValueSortModel,
        setValueFilterModel
    }
}
