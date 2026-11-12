import { Alert, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';
import { GrapLayout } from '../../../shared/layout/GraphLayout';
import { useAppSelector } from '../../../hooks/hooks';
import { selectSessionUser } from '../../auth/selectors';
import { canAccess, type AccessDomain } from '../../auth/access';

const destinations: { domain: AccessDomain; path: string; title: string; description: string }[] = [
  { domain: 'confiscation', path: '/confiscation', title: 'Decomisos', description: 'Consulta los registros y sus detalles de drogas, armas y municiones.' },
  { domain: 'graph', path: '/graph', title: 'Gráficos', description: 'Consulta las cantidades registradas con los filtros de análisis disponibles.' },
  { domain: 'map', path: '/map', title: 'Mapa', description: 'Explora la ubicación de los registros mediante los filtros disponibles.' },
  { domain: 'drug', path: '/drug', title: 'Drogas', description: 'Consulta el catálogo de sustancias utilizado en los registros.' },
  { domain: 'weapon', path: '/weapon', title: 'Armas', description: 'Consulta el catálogo de armas utilizado en los registros.' },
  { domain: 'ammunition', path: '/ammunition', title: 'Municiones', description: 'Consulta el catálogo de municiones utilizado en los registros.' },
  { domain: 'drugPresentation', path: '/drugPresentation', title: 'Presentaciones de droga', description: 'Consulta las presentaciones utilizadas para registrar sustancias.' },
  { domain: 'user', path: '/user', title: 'Usuarios', description: 'Gestiona las cuentas y sus asignaciones según tus permisos.' },
  { domain: 'role', path: '/rol', title: 'Roles', description: 'Consulta los roles y sus permisos asignados.' },
  { domain: 'permission', path: '/permiso', title: 'Permisos', description: 'Consulta el catálogo de permisos de la aplicación.' },
  { domain: 'activity', path: '/actividad', title: 'Actividad', description: 'Consulta los eventos registrados por el sistema.' },
];

export const DashBoardView = () => {
  const user = useAppSelector(selectSessionUser);
  const available = destinations.filter(item => canAccess(user, item.domain));

  return (
      <GrapLayout>
        <Stack spacing={3}>
          <Box>
            <Typography variant="overline" color="text.secondary">Gestión y análisis de decomisos</Typography>
            <Typography component="h1" variant="h4">Panel de inicio</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>Accede a los registros y herramientas disponibles para tu sesión.</Typography>
          </Box>
          <Alert severity="info">Entorno de demostración. Los registros del entorno pueden incluir datos de ejemplo; no representan cifras oficiales. Este panel no muestra indicadores agregados.</Alert>
          <Box component="section" aria-labelledby="dashboard-tools">
            <Typography id="dashboard-tools" component="h2" variant="h5" sx={{ mb: 2 }}>Herramientas disponibles</Typography>
            {available.length === 0 ? <Alert severity="info">No tienes herramientas habilitadas. Puedes actualizar tus permisos o cerrar sesión desde la barra superior.</Alert> :
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>
                {available.map(item => <Card key={item.path} variant="outlined">
                  <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography component="h3" variant="h6">{item.title}</Typography>
                    <Typography color="text.secondary" sx={{ flexGrow: 1 }}>{item.description}</Typography>
                    <Button component={Link} to={item.path} sx={{ alignSelf: 'flex-start' }}>Abrir {item.title.toLocaleLowerCase('es')}</Button>
                  </CardContent>
                </Card>)}
              </Box>}
          </Box>
          <Typography color="text.secondary" variant="body2">Los listados consultan la API del entorno. En gráficos y mapa, aplica filtros para consultar resultados. Las opciones de cada vista dependen de tus permisos; el servidor valida cada operación.</Typography>
        </Stack>
      </GrapLayout>
  )
}
