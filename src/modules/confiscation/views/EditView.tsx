import { ConfiscationForm,SubConfiscations } from '../components'
import { GrapLayout } from '../../../shared/layout/GraphLayout'
import { BackFloatingButton } from '../../../components'
import {  useParams } from 'react-router'
import Grid from '@mui/material/Grid2';
import { useConfiscationForm } from '../hooks';
import { useEffect } from 'react';
import { useAppDispatch } from '../../../hooks/hooks';
import { startLoadingConfiscation } from '../thunks';


export const EditView = () => {
  const { loading,activeConfiscation } = useConfiscationForm()
  let { confiscationId } = useParams();

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (confiscationId) {
      dispatch(startLoadingConfiscation(confiscationId));
    }
  }, [confiscationId])

  return (
    <GrapLayout>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 1 }}>
          <BackFloatingButton />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          {!loading &&
            <ConfiscationForm/>
          }
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          {(activeConfiscation.id) &&
          <SubConfiscations />
          }
        </Grid>
      </Grid>
    </GrapLayout>
  )
}
