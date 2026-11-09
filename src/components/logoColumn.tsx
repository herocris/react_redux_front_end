import { Avatar, Box } from '@mui/material';
import type { GridColDef, GridValidRowModel } from '@mui/x-data-grid';
import { getEnvVariables } from '../helpers/getEnvVariables';
export const logoColumn = <T extends GridValidRowModel,>(): GridColDef<T> => ({
    field: 'logo', headerName: 'logo', sortable: false, filterable: false, align: 'center', headerAlign: 'center',
    renderCell: ({ value, row }) => {
        const name = row.name || row.nombre || 'N/A';
        const imageUrl = typeof value === 'string' && value.length > 0 ? getEnvVariables().VITE_LOCAL_PHOTOS_URL + '/' + value : undefined;
        return <Box display="flex" justifyContent="center" alignItems="center" width="100%">
            <Avatar src={imageUrl} alt={name} sx={{ width: 40, height: 40, bgcolor: imageUrl ? 'transparent' : 'primary.main' }}>
                {!imageUrl && name.charAt(0).toUpperCase()}
            </Avatar>
        </Box>;
    },
});
