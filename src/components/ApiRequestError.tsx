import { useState } from 'react';
import { Alert, Button } from '@mui/material';
import { getApiErrorKind, getApiErrorText } from '../api/apiErrors';
import { useAppDispatch } from '../hooks/hooks';
import { startLogout } from '../modules/auth/thunks';
import { AccessDenied } from './AccessDenied';

interface Props {
    error: unknown;
    retry: () => void;
    busy?: boolean;
    retryLabel?: string;
}

const SessionAccessDenied = ({ retry, busy, retryLabel }: Omit<Props, 'error'>) => {
    const dispatch = useAppDispatch();
    const [pending, setPending] = useState(false);
    const [logoutError, setLogoutError] = useState('');
    const logout = async () => {
        setPending(true);
        setLogoutError('');
        try { await dispatch(startLogout()); }
        catch (error) { setLogoutError(getApiErrorText(error)); }
        finally { setPending(false); }
    };
    return <>
        <AccessDenied>
            <Button onClick={retry} disabled={busy || pending}>{retryLabel}</Button>
            <Button onClick={() => void logout()} disabled={pending}>Cerrar sesión</Button>
        </AccessDenied>
        {logoutError && <Alert severity="error">No se pudo cerrar la sesión. {logoutError}</Alert>}
    </>;
};

export const ApiRequestError = ({ error, retry, busy = false, retryLabel = 'Reintentar' }: Props) => {
    if (error == null) return null;
    if (getApiErrorKind(error) === 'forbidden') {
        return <SessionAccessDenied retry={retry} busy={busy} retryLabel={retryLabel} />;
    }
    return <Alert severity="error" action={<Button onClick={retry} disabled={busy}>{retryLabel}</Button>}>
        {getApiErrorText(error)}
    </Alert>;
};
