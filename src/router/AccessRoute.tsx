import type { ReactNode } from 'react';
import { Button } from '@mui/material';
import { Link, Navigate } from 'react-router';
import { AccessDenied } from '../components/AccessDenied';
import { GrapLayout } from '../shared/layout/GraphLayout';
import { useAppSelector } from '../hooks/hooks';
import { selectSessionUser } from '../modules/auth/selectors';
import { firstAllowedPath, type AccessDomain, type AccessAction } from '../modules/auth/access';
import { useAccess } from '../modules/auth/hooks/useAccess';

export const DeniedRoute = () => {
    const user = useAppSelector(selectSessionUser);
    const destination = firstAllowedPath(user);
    return <GrapLayout><AccessDenied>
        {destination && <Button component={Link} to={destination}>Ir a una vista permitida</Button>}
    </AccessDenied></GrapLayout>;
};

// Unauthorized children never mount, so their hooks cannot start requests.
export const AccessRoute = ({ domain, action = 'view', children }: {
    domain: AccessDomain; action?: AccessAction; children: ReactNode;
}) => {
    const access = useAccess(domain);
    return access[action] ? children : <DeniedRoute />;
};
export const SessionLanding = () => {
    const user = useAppSelector(selectSessionUser);
    const destination = firstAllowedPath(user);
    return destination ? <Navigate to={destination} replace /> : <DeniedRoute />;
};
