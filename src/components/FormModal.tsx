import type { FormEventHandler, ReactElement, ReactNode } from 'react';
import { Box, Modal, Typography, Zoom } from '@mui/material';
import { boxStyleFormModal } from '../helpers/boxStyle';

interface FormModalProps {
    titleId: string;
    title: string;
    busy: boolean;
    onClose: () => void;
    onSubmit: FormEventHandler<HTMLFormElement>;
    status?: ReactNode;
    children: ReactElement;
}

// The domain owns RHF, fields and actions; this frame only owns presentation.
export const FormModal = ({ titleId, title, busy, onClose, onSubmit, status, children }: FormModalProps) => (
    <Modal open onClose={() => { if (!busy) onClose(); }} aria-labelledby={titleId}>
        <Box sx={boxStyleFormModal} role="dialog" aria-modal="true" aria-labelledby={titleId}>
            <Typography id={titleId} variant="h5" sx={{ mb: 1 }}>{title}</Typography>
            {status}
            <form onSubmit={event => {
                if (busy) { event.preventDefault(); return; }
                void onSubmit(event);
            }}>
                <fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
                    <Zoom in style={{ transitionDelay: '150ms' }}>
                        {children}
                    </Zoom>
                </fieldset>
            </form>
        </Box>
    </Modal>
);
