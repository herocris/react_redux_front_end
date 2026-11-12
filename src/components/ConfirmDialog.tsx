import { useId, type ReactNode } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

interface ConfirmDialogProps {
    title: string;
    message: string;
    busy?: boolean;
    onCancel: () => void;
    onConfirm: () => void | Promise<void>;
    confirmLabel?: string;
    children?: ReactNode;
}

export const ConfirmDialog = ({ title, message, busy = false, onCancel, onConfirm,
    confirmLabel = 'Borrar', children }: ConfirmDialogProps) => {
    const id = useId();
    return <Dialog open onClose={() => { if (!busy) onCancel(); }}
        aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}>
        <DialogTitle id={`${id}-title`}>{title}</DialogTitle>
        <DialogContent>
            <DialogContentText id={`${id}-description`}>{message}</DialogContentText>
            {children}
        </DialogContent>
        <DialogActions>
            <Button autoFocus disabled={busy} onClick={onCancel}>Cancelar</Button>
            <Button loading={busy} onClick={() => { if (!busy) void onConfirm(); }} color="error">{confirmLabel}</Button>
        </DialogActions>
    </Dialog>;
};
