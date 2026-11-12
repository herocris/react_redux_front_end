import { AccessRoute, SessionLanding } from './AccessRoute';
import { Navigate, Route, Routes } from 'react-router';
import { AuthRoutes } from '../modules/auth';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { selectAuthStatus } from '../modules/auth/selectors';
import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { checkAuthToken } from '../modules/auth/thunks';
import { Alert, Box, Button, CircularProgress } from '@mui/material';
import { ApiRequestError } from '../components/ApiRequestError';
import { useAuthorizationRefresh } from '../modules/auth/hooks/useAuthorizationRefresh';
import { refreshAuthorization } from '../modules/auth/thunks/refreshAuthorization';
import { startLogout } from '../modules/auth/thunks';
import { ViewErrorBoundary } from './ViewErrorBoundary';


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
    const status = useAppSelector(selectAuthStatus);
    const dispatch = useAppDispatch();
    const { authorizationRevision, authorizationError } = useAppSelector(state => state.auth);
    useAuthorizationRefresh(status === 'authenticated');
    const [accessBusy, setAccessBusy] = useState(false);
    const [logoutFailure, setLogoutFailure] = useState(false);
    const recoverAccess = async (logout = false) => {
        setAccessBusy(true);
        setLogoutFailure(false);
        try { await dispatch(logout ? startLogout() : refreshAuthorization()); }
        catch { setLogoutFailure(true); }
        finally { setAccessBusy(false); }
    };
    const [sessionFailure, setSessionFailure] = useState<unknown>(null);
    const [checking, setChecking] = useState(false);
    const checkSession = useCallback(async () => {
        setChecking(true);
        try { await dispatch(checkAuthToken()); setSessionFailure(null); }
        catch (error) { setSessionFailure(error); }
        finally { setChecking(false); }
    }, [dispatch]);
    useEffect(() => {
        void checkSession();
    }, [checkSession])



    if (status === 'checking') {
        if (sessionFailure != null) return <Box component="main" sx={{ p: 3 }}>
            <ApiRequestError error={sessionFailure} retry={() => void checkSession()} busy={checking} />
        </Box>;
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
    if (status === 'authenticated' && authorizationError !== null) return <Box component="main" sx={{ p: 3 }}>
        <Alert severity="error">No se pudieron verificar tus permisos. {authorizationError}</Alert>
        <Button disabled={accessBusy} onClick={() => void recoverAccess()}>Actualizar permisos</Button>
        <Button disabled={accessBusy} onClick={() => void recoverAccess(true)}>Cerrar sesión</Button>
        {logoutFailure && <Alert severity="error">No se pudo cerrar la sesión.</Alert>}
    </Box>;
    return (
        <ViewErrorBoundary>
        <Suspense key={authorizationRevision} fallback={<RouteLoading />}>
        <Routes>
            {
                status === 'not-authenticated'
                    ? <Route path='/auth/*' element={<AuthRoutes />} />
                    :
                    <>
                        <Route path='/user/*' element={<AccessRoute domain="user"><UserRoutes /></AccessRoute>} />
                        <Route path='/dashboard/*' element={<AccessRoute domain="dashboard"><DashBoardRoutes /></AccessRoute>} />
                        <Route path='/rol/*' element={<AccessRoute domain="role"><RoleRoutes /></AccessRoute>} />
                        <Route path='/permiso/*' element={<AccessRoute domain="permission"><PermissionRoutes /></AccessRoute>} />
                        <Route path='/actividad/*' element={<AccessRoute domain="activity"><ActivityRoutes /></AccessRoute>} />
                        <Route path='/ammunition/*' element={<AccessRoute domain="ammunition"><AmmunitionRoutes /></AccessRoute>} />
                        <Route path='/drug/*' element={<AccessRoute domain="drug"><DrugRoutes /></AccessRoute>} />
                        <Route path='/weapon/*' element={<AccessRoute domain="weapon"><WeaponRoutes /></AccessRoute>} />
                        <Route path='/drugPresentation/*' element={<AccessRoute domain="drugPresentation"><DrugPresentationRoutes /></AccessRoute>} />
                        <Route path='/confiscation/*' element={<AccessRoute domain="confiscation"><ConfiscationRoutes /></AccessRoute>} />
                        <Route path='/*' element={<SessionLanding />} />
                        <Route path='/graph' element={<AccessRoute domain="graph"><GraphView /></AccessRoute>} />
                        <Route path='/map' element={<AccessRoute domain="map"><MapView /></AccessRoute>} />
                    </>
            }
            <Route path='/*' element={<Navigate to="/auth/login" />} />
        </Routes>
        </Suspense>
        </ViewErrorBoundary>
    )
}
