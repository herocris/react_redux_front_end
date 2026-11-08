import { Navigate, Route, Routes } from 'react-router';
import { AuthRoutes } from '../modules/auth';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { RootState } from '../store';
import { lazy, Suspense, useEffect } from 'react';
import { checkAuthToken } from '../modules/auth/thunks';
import { Box, CircularProgress } from '@mui/material';


const UserRoutes = lazy(() => import('../modules/user/routes/UserRoutes').then(module => ({ default: module.UserRoutes })));
const RoleRoutes = lazy(() => import('../modules/rol/routes/RoleRoutes').then(module => ({ default: module.RoleRoutes })));
const PermissionRoutes = lazy(() => import('../modules/permission/routes/PermissionRoutes').then(module => ({ default: module.PermissionRoutes })));
const AmmunitionRoutes = lazy(() => import('../modules/ammunition/routes/AmmunitionRoutes').then(module => ({ default: module.AmmunitionRoutes })));
const DrugRoutes = lazy(() => import('../modules/drug/routes/DrugRoutes').then(module => ({ default: module.DrugRoutes })));
const WeaponRoutes = lazy(() => import('../modules/weapon/routes/WeaponRoutes').then(module => ({ default: module.WeaponRoutes })));
const DrugPresentationRoutes = lazy(() => import('../modules/drugPresentation/routes/DrugPresentationRoutes').then(module => ({ default: module.DrugPresentationRoutes })));
const ConfiscationRoutes = lazy(() => import('../modules/confiscation/routes/ConfiscationRoutes').then(module => ({ default: module.ConfiscationRoutes })));
const GraphView = lazy(() => import('../modules/graph/views/GraphView').then(module => ({ default: module.GraphView })));
const MapView = lazy(() => import('../modules/map/views/MapView').then(module => ({ default: module.MapView })));
const ActivityRoutes = lazy(() => import('../modules/activity/routes/ActivityRoutes').then(module => ({ default: module.ActivityRoutes })));
const DashBoardRoutes = lazy(() => import('../modules/dashboard/routes/DashBoardRoutes').then(module => ({ default: module.DashBoardRoutes })));

const RouteLoading = () => (
    <Box role="status" aria-label="Cargando vista" sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress size={60} />
    </Box>
);

export const AppRouter = () => {
    const { status } = useAppSelector((state: RootState) => state.auth);
    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(checkAuthToken())
    }, [dispatch])



    if (status === 'checking') {
        return (
            <Box
                sx={{
                    height: '100vh',
                    width: '100vw',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <CircularProgress size={60} />
            </Box>
        )
    }
    return (
        <Suspense fallback={<RouteLoading />}>
        <Routes>
            {
                status === 'not-authenticated'
                    ? <Route path='/auth/*' element={<AuthRoutes />} />
                    :
                    <>
                        <Route path='/user/*' element={<UserRoutes />} />
                        <Route path='/dashboard/*' element={<DashBoardRoutes />} />
                        <Route path='/rol/*' element={<RoleRoutes />} />
                        <Route path='/permiso/*' element={<PermissionRoutes />} />
                        <Route path='/actividad/*' element={<ActivityRoutes />} />
                        <Route path='/ammunition/*' element={<AmmunitionRoutes />} />
                        <Route path='/drug/*' element={<DrugRoutes />} />
                        <Route path='/weapon/*' element={<WeaponRoutes />} />
                        <Route path='/drugPresentation/*' element={<DrugPresentationRoutes />} />
                        <Route path='/confiscation/*' element={<ConfiscationRoutes />} />
                        <Route path='/*' element={<Navigate to="/dashboard" />} />
                        <Route path='/graph' element={<GraphView/>} />
                        <Route path='/map' element={<MapView/>} />
                    </>
            }
            <Route path='/*' element={<Navigate to="/auth/login" />} />
        </Routes>
        </Suspense>
    )
}
