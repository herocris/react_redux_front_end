import Grid from '@mui/material/Grid2';
import { BarGraph, LineGraph } from '../../graph/components';
import { EntityList, } from '../../../components';
import { GrapLayout } from '../../../shared/layout/GraphLayout';
import { useDrugView } from '../../drug/hooks';
import {MapComponent } from '../../map';
import { Typography } from '@mui/material';
import { barLineGraph, Mapitems } from '../demoData';


export const DashBoardView = () => {
  const {
    LoadingEntities,
    columnsTable,
    loading,
    tableOptions,
    drugs,
  } = useDrugView()

  return (
    <>
      <GrapLayout>
        <Typography variant='h5' sx={{ mb: 3,mt: 3 }}>Rechart Charts</Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 12, lg: 6 }}>
            <BarGraph data={barLineGraph} />
          </Grid>
          <Grid size={{ xs: 12, md: 12, lg: 6 }}>
            <LineGraph data={barLineGraph} />
          </Grid>
        </Grid>

        <Typography variant='h5' sx={{ mb: 1 }}>Leaflet Maps</Typography>
        <Grid container spacing={3} sx={{ mb: 3,mt: 3 }}>
          <Grid size={{ xs: 12, md: 12, lg: 6 }}>
            <MapComponent Mapitems={Mapitems} typeMap='location' heightMap="50vh" />
          </Grid>
          <Grid size={{ xs: 12, md: 12, lg: 6 }}>
            <MapComponent Mapitems={Mapitems} typeMap='hot' heightMap="50vh" />
          </Grid>
        </Grid>
        <Typography variant='h4' sx={{ mb: 3 }}>Demo Dashboard</Typography>
        <Typography variant='h5' sx={{ mb: 3 }}>Material UI DataGrid</Typography>
        <EntityList
          handleOpen={() => { }}
          handleOpenDialog={() => { }}
          LoadingEntities={LoadingEntities}
          setIdEntity={() => { }}
          EntityCollection={drugs}
          tableOptions={tableOptions}
          loading={loading}
          columnsTable={columnsTable}
          editable={false}
        />
        
      </GrapLayout>
    </>
  )
}
