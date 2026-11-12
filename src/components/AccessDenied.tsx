import { useId, type ReactNode } from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';

// Navigation/session policy belongs to the caller (including future guards).
// Require explicit actions: never guess that dashboard/history is permitted.
export const AccessDenied = ({ children }: { children: ReactNode }) => {
    const titleId = useId();
    return <Alert severity="warning" role="alert" aria-labelledby={titleId}>
        <AlertTitle id={titleId}>Acceso denegado</AlertTitle>
        No tienes permiso para realizar esta operación. Tu sesión sigue abierta.
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>{children}</Box>
    </Alert>;
};
