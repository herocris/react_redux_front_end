import { Alert } from '@mui/material';
import { ApiRequestError } from '../../../components/ApiRequestError';

export interface PermissionOptionsStatusProps {
    pending: boolean;
    error: unknown;
    retry: () => void;
}

export const PermissionOptionsStatus = ({ pending, error, retry }: PermissionOptionsStatusProps) => (
    error ? <ApiRequestError error={error} retry={retry} retryLabel="Reintentar permisos" />
        : pending ? <Alert severity="info">Cargando permisos…</Alert> : null
);
