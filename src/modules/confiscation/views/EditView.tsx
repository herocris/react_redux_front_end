import { Typography } from '@mui/material';
import { parseRouteId } from '../../../api/identifiers';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { Alert, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { ConfiscationForm, SubConfiscations } from '../components';
import { GrapLayout } from '../../../shared/layout/GraphLayout';
import { BackFloatingButton } from '../../../components';
import { ApiRequestError } from '../../../components/ApiRequestError';
import { confiscationDetailOptions } from '../queries/confiscationQueries';

export const EditView = ({ readOnly = false }: { readOnly?: boolean }) => {
    const { confiscationId = '' } = useParams();
    let id: number;
    try { id = parseRouteId(confiscationId); }
    catch { return <GrapLayout><Alert severity="error">Identificador de ruta no válido.</Alert><BackFloatingButton /></GrapLayout>; }
    return <EditConfiscation id={id} readOnly={readOnly} />;
};

const EditConfiscation = ({ id: confiscationId, readOnly }: { id: number; readOnly: boolean }) => {
    const query = useQuery(confiscationDetailOptions(confiscationId));
    return <GrapLayout>
        <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 1 }}><BackFloatingButton /></Grid>
            <Grid size={{ xs: 12, md: 5 }}>
                {query.isFetching && <CircularProgress aria-label="Cargando decomiso" size={24} />}
                {query.isError && <ApiRequestError error={query.error} busy={query.isFetching} retry={() => void query.refetch()} />}
                {query.data && (readOnly ? <><Typography variant="h5">Detalle de decomiso</Typography>{[query.data.fecha, query.data.observacion, query.data.direccion, query.data.departamento, query.data.municipalidad].map((value, index) => <Typography key={index}>{value}</Typography>)}</> : <ConfiscationForm key={confiscationId} initial={query.data} />)}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                {query.data && <SubConfiscations key={confiscationId} />}
            </Grid>
        </Grid>
    </GrapLayout>;
};
