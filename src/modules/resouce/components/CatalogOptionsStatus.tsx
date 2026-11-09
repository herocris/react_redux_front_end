import { Alert, Button } from '@mui/material';
import { getApiErrorText } from '../../../api/apiErrors';
import type { OptionsStatus } from '../queries/optionsStatus';
export const CatalogOptionsStatus = ({ pending, error, retry }: OptionsStatus) => error
    ? <Alert severity="error" action={<Button onClick={retry}>Reintentar catálogos</Button>}>{getApiErrorText(error)}</Alert>
    : pending ? <Alert severity="info">Cargando catálogos…</Alert> : null;
