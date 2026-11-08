import { Avatar, Box } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { EntityList } from './EntityList';
import { useEntityList } from '../hooks/useEntityList';
import { getEnvVariables } from '../helpers/getEnvVariables';
import type { EntityListProps as LegacyEntityListProps } from '../shared/interfaces/sharedInterfaces';

// Remove this adapter once the remaining Redux lists have migrated.
export const LegacyEntityList = ({
    handleOpen, handleOpenDialog, setIdEntity, LoadingEntities, tableOptions,
    EntityCollection, columnsTable, loading, editable = true,
}: LegacyEntityListProps) => {
    const models = useEntityList(LoadingEntities, tableOptions);
    const { VITE_LOCAL_PHOTOS_URL } = getEnvVariables();
    const columns: GridColDef<LegacyEntityListProps['EntityCollection'][number]>[] = columnsTable.map(field => (
        field === 'logo' ? {
            field, headerName: field, sortable: false, filterable: false,
            align: 'center', headerAlign: 'center',
            renderCell: ({ value, row }) => {
                const name = row.name || row.nombre || 'N/A';
                const imageUrl = typeof value === 'string' && value.length > 0
                    ? VITE_LOCAL_PHOTOS_URL + '/' + value : undefined;
                return <Box display="flex" justifyContent="center" alignItems="center" width="100%">
                    <Avatar src={imageUrl} alt={name} sx={{ width: 40, height: 40, bgcolor: imageUrl ? 'transparent' : 'primary.main' }}>
                        {!imageUrl && name.charAt(0).toUpperCase()}
                    </Avatar>
                </Box>;
            },
        } : { field, headerName: field, flex: 1 }
    ));
    return <EntityList
        {...models}
        rows={EntityCollection} columns={columns} loading={loading} rowCount={tableOptions.total}
        onEdit={editable ? row => {
            if (row.id === undefined) return;
            setIdEntity(row.id, 'editar');
            handleOpen(true);
        } : undefined}
        onDelete={editable ? row => {
            if (row.id === undefined) return;
            setIdEntity(row.id, 'borrar');
            handleOpenDialog();
        } : undefined}
    />;
};
