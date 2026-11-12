import { Alert } from '@mui/material';
import { ApiRequestError } from '../../../components/ApiRequestError';
import type { OptionsStatus } from '../queries/optionsStatus';
export const CatalogOptionsStatus = ({ pending, error, retry }: OptionsStatus) => error
    ? <ApiRequestError error={error} retry={retry} retryLabel="Reintentar catálogos" />
    : pending ? <Alert severity="info">Cargando catálogos…</Alert> : null;
