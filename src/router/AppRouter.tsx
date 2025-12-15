import { Navigate, Route, Routes } from 'react-router';
import { AuthRoutes } from '../modules/auth';
import { UserRoutes } from '../modules/user';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { RootState } from '../store';
import { useEffect } from 'react';
import { checkAuthToken } from '../modules/auth/thunks';
import { RoleRoutes } from '../modules/rol';
import { PermissionRoutes } from '../modules/permission';
import { Box, CircularProgress } from '@mui/material';
import { AmmunitionRoutes } from '../modules/ammunition';
import { DrugRoutes } from '../modules/drug';
import { WeaponRoutes } from '../modules/weapon';
import { DrugPresentationRoutes } from '../modules/drugPresentation';
import { ConfiscationRoutes } from '../modules/confiscation';
import { GraphView } from '../modules/graph';
import { MapView } from '../modules/map';
import { ActivityRoutes } from '../modules/activity';
import { DashBoardRoutes } from '../modules/dashboard/routes';


export const AppRouter = () => {
    const { status } = useAppSelector((state: RootState) => state.auth);
    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(checkAuthToken())
    }, [])



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
    )
}
