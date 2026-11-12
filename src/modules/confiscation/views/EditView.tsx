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

export const EditView = () => {
    const { confiscationId = '' } = useParams();
    let id: number;
    try { id = parseRouteId(confiscationId); }
    catch { return <GrapLayout><Alert severity="error">Identificador de ruta no válido.</Alert><BackFloatingButton /></GrapLayout>; }
    return <EditConfiscation id={id} />;
};

const EditConfiscation = ({ id: confiscationId }: { id: number }) => {
    const query = useQuery(confiscationDetailOptions(confiscationId));
    return <GrapLayout>
        <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 1 }}><BackFloatingButton /></Grid>
            <Grid size={{ xs: 12, md: 5 }}>
                {query.isFetching && <CircularProgress aria-label="Cargando decomiso" size={24} />}
                {query.isError && <ApiRequestError error={query.error} busy={query.isFetching} retry={() => void query.refetch()} />}
                {query.data && <ConfiscationForm key={confiscationId} initial={query.data} />}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                {query.data && <SubConfiscations key={confiscationId} />}
            </Grid>
        </Grid>
    </GrapLayout>;
};
