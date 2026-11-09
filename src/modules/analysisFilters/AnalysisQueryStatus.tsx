import { Alert, Button, LinearProgress } from '@mui/material';
import { getApiErrorText } from '../../api/apiErrors';

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
    {error != null && <Alert severity="error" action={<Button disabled={fetching} onClick={retry}>Reintentar</Button>}>
        {getApiErrorText(error)}
    </Alert>}
    {enabled && !fetching && !error && empty && <Alert severity="info">No hay resultados para los filtros aplicados.</Alert>}
</>;
