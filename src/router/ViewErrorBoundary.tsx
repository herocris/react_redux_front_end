import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { Link, useLocation } from 'react-router';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { accessDestinations, canAccess } from '../modules/auth/access';
import { selectSessionUser } from '../modules/auth/selectors';
import { startLogout } from '../modules/auth/thunks';

const ViewFailure = ({ retry }: { retry?: () => void }) => {
    const heading = useRef<HTMLHeadingElement>(null);
    const { pathname } = useLocation();
    const { status } = useAppSelector(state => state.auth);
    const user = useAppSelector(selectSessionUser);
    const dispatch = useAppDispatch();
    const [busy, setBusy] = useState(false);
    const [logoutFailed, setLogoutFailed] = useState(false);
    const destination = accessDestinations.find(item => canAccess(user, item.domain)
        && pathname !== item.path && !pathname.startsWith(`${item.path}/`));
    useEffect(() => { heading.current?.focus(); }, []);
    const logout = async () => {
        setBusy(true);
        setLogoutFailed(false);
        try { await dispatch(startLogout()); }
        catch { setLogoutFailed(true); }
        finally { setBusy(false); }
    };
    return <Box component="main" sx={{ p: { xs: 2, sm: 4 }, maxWidth: 700, mx: 'auto' }}>
        <Stack spacing={2}>
            <Typography component="h1" variant="h5" tabIndex={-1} ref={heading}>No se pudo mostrar esta vista</Typography>
            <Alert severity="error">Ocurrió un problema al mostrar o cargar la vista. Puedes intentar recuperarla o salir de ella.</Alert>
            <Typography>Los cambios sin guardar de esta vista pueden haberse perdido. Si el problema continúa, prueba a recargar la página cuando tengas conexión.</Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                {retry && <Button variant="contained" onClick={retry}>Reintentar vista</Button>}
                <Button disabled={busy} onClick={() => { setBusy(true); window.location.reload(); }}>Recargar página</Button>
                {status === 'authenticated'
                    ? <>
                        {destination && <Button component={Link} to={destination.path}>Ir a otra vista permitida</Button>}
                        <Button disabled={busy} onClick={() => void logout()}>Cerrar sesión</Button>
                    </>
                    : pathname !== '/auth/login' && <Button component={Link} to="/auth/login">Ir al acceso</Button>}
            </Stack>
            {logoutFailed && <Alert severity="error">No se pudo cerrar la sesión. Puedes intentarlo de nuevo.</Alert>}
        </Stack>
    </Box>;
};

class ViewBoundary extends Component<{ children: ReactNode }, { failed: boolean; retried: boolean }> {
    state = { failed: false, retried: false };

    // Store no error payload: the fallback never renders exception details.
    static getDerivedStateFromError() { return { failed: true }; }

    render() {
        if (this.state.failed) return <ViewFailure retry={this.state.retried ? undefined : () => {
            this.setState({ failed: false, retried: true });
        }} />;
        return this.props.children;
    }
}

export const ViewErrorBoundary = ({ children }: { children: ReactNode }) => {
    const location = useLocation();
    const { status, authorizationRevision } = useAppSelector(state => state.auth);
    // Navigation/session changes recover the view without remounting the providers.
    return <ViewBoundary key={`${location.key}:${status}:${authorizationRevision}`}>{children}</ViewBoundary>;
};
