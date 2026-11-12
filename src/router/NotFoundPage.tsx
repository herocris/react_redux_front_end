import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import { Link, useLocation } from 'react-router';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { selectAuthStatus, selectSessionUser } from '../modules/auth/selectors';
import { firstAllowedPath } from '../modules/auth/access';
import { startLogout } from '../modules/auth/thunks';

export const NotFoundPage = () => {
    const status = useAppSelector(selectAuthStatus);
    const user = useAppSelector(selectSessionUser);
    const dispatch = useAppDispatch();
    const { pathname } = useLocation();
    const heading = useRef<HTMLHeadingElement>(null);
    const [busy, setBusy] = useState(false);
    const [logoutFailed, setLogoutFailed] = useState(false);
    const authenticated = status === 'authenticated';
    const destination = authenticated ? firstAllowedPath(user) : undefined;
    useEffect(() => { heading.current?.focus(); }, [pathname]);
    const logout = async () => {
        setBusy(true);
        setLogoutFailed(false);
        try { await dispatch(startLogout()); }
        catch { setLogoutFailed(true); }
        finally { setBusy(false); }
    };
    return <Box component="main" sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: { xs: 2, sm: 4 }, bgcolor: 'background.default' }}>
        <Paper variant="outlined" sx={{ p: { xs: 3, sm: 5 }, maxWidth: 640, width: '100%' }}>
            <Stack spacing={2}>
                <Typography variant="h3" component="p" color="primary">404</Typography>
                <Typography component="h1" variant="h5" tabIndex={-1} ref={heading}>Página no encontrada</Typography>
                <Typography color="text.secondary">Esta dirección no corresponde a una página de la aplicación. Comprueba el enlace o elige cómo continuar.</Typography>
                {authenticated && !destination && <Typography>No tienes vistas habilitadas con tus permisos actuales. Puedes cerrar sesión para acceder con otra cuenta.</Typography>}
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                    {authenticated ? <>
                        {destination && <Button variant="contained" component={Link} to={destination}>Ir a una vista permitida</Button>}
                        <Button disabled={busy} onClick={() => void logout()}>Cerrar sesión</Button>
                    </> : <Button variant="contained" component={Link} to="/auth/login">Ir al acceso</Button>}
                </Stack>
                {logoutFailed && <Alert severity="error">No se pudo cerrar la sesión. Puedes intentarlo de nuevo.</Alert>}
            </Stack>
        </Paper>
    </Box>;
};
