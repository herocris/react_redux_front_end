import { Alert, LinearProgress } from '@mui/material';
import { ApiRequestError } from '../../components/ApiRequestError';

interface Props {
    enabled: boolean;
    fetching: boolean;
    error: unknown;
    empty: boolean;
    retry: () => void;
}

export const AnalysisQueryStatus = ({ enabled, fetching, error, empty, retry }: Props) => <>
    {!enabled && <Alert severity="info">Aplica filtros válidos para consultar resultados.</Alert>}
    {fetching && <LinearProgress aria-label="Cargando resultados" />}
    <ApiRequestError error={error} retry={retry} busy={fetching} />
    {enabled && !fetching && !error && empty && <Alert severity="info">No hay resultados para los filtros aplicados.</Alert>}
</>;
