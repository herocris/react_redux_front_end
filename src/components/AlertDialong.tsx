import { ConfirmDialog } from './ConfirmDialog';
import type { AlertDialogProps } from '../shared/interfaces/sharedInterfaces';

export const AlertDialog = ({ DeleteEntity, handleOpen, title, dialogMessage }: AlertDialogProps) => (
    <ConfirmDialog title={title} message={dialogMessage} onCancel={() => handleOpen()}
        onConfirm={() => DeleteEntity()} confirmLabel="Ok" />
);
