import { Avatar, Box } from '@mui/material';
import type { GridColDef, GridValidRowModel } from '@mui/x-data-grid';
import { getMediaUrl } from '../helpers/getMediaUrl';
export const logoColumn = <T extends GridValidRowModel,>(): GridColDef<T> => ({
    field: 'logo', headerName: 'Imagen', sortable: false, filterable: false, align: 'center', headerAlign: 'center',
    renderCell: ({ value, row }) => {
        const name = row.descripcion || row.name || row.nombre || 'N/A';
        const imageUrl = getMediaUrl(value);
        return <Box display="flex" justifyContent="center" alignItems="center" width="100%">
            <Avatar src={imageUrl} alt={name} sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                {name.charAt(0).toUpperCase()}
            </Avatar>
        </Box>;
    },
});
