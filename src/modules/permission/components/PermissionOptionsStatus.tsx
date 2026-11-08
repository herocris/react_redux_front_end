import { Alert, Button } from '@mui/material';
import { getApiErrorText } from '../../../api/apiErrors';

export interface PermissionOptionsStatusProps {
    pending: boolean;
    error: unknown;
    retry: () => void;
}

export const PermissionOptionsStatus = ({ pending, error, retry }: PermissionOptionsStatusProps) => (
    error ? <Alert severity="error" action={<Button onClick={retry}>Reintentar permisos</Button>}>
        {getApiErrorText(error)}
    </Alert> : pending ? <Alert severity="info">Cargando permisos…</Alert> : null
);
