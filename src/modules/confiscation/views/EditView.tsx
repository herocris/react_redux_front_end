import { ConfiscationForm,SubConfiscations } from '../components'
import { GrapLayout } from '../../../shared/layout/GraphLayout'
import { BackFloatingButton } from '../../../components'
import {  useParams } from 'react-router'
import Grid from '@mui/material/Grid2';
import { useConfiscationForm } from '../hooks';
import { useEffect, useState } from 'react';
import { Alert, Button } from '@mui/material';
import { getApiErrorText } from '../../../api/apiErrors';
import { useAppDispatch } from '../../../hooks/hooks';
import { startLoadingConfiscation } from '../thunks';


export const EditView = () => {
  const { activeConfiscation } = useConfiscationForm()
  const { confiscationId } = useParams();

  const dispatch = useAppDispatch();

  const [loadedId, setLoadedId] = useState<string>();
  const [loadError, setLoadError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let current = true;
    if (confiscationId) {
      dispatch(startLoadingConfiscation(confiscationId)).then(() => {
        if (current) setLoadedId(confiscationId);
      }).catch((error: unknown) => {
        if (current) setLoadError(getApiErrorText(error));
      });
    }
    return () => { current = false; };
  }, [confiscationId, dispatch, attempt]);

  return (
    <GrapLayout>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 1 }}>
          <BackFloatingButton />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          {loadError && <Alert severity="error">{loadError}<Button onClick={() => { setLoadError(''); setAttempt(value => value + 1); }}>Reintentar</Button></Alert>}
          {loadedId === confiscationId &&
            <ConfiscationForm/>
          }
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          {loadedId === confiscationId && activeConfiscation.id &&
          <SubConfiscations />
          }
        </Grid>
      </Grid>
    </GrapLayout>
  )
}
