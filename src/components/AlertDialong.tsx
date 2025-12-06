import { Grow } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { TransitionProps } from '@mui/material/transitions';
import React, { memo } from 'react';
import { AlertDialogProps } from '../shared/interfaces/sharedInterfaces';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Grow
        in={true}
        style={{ transformOrigin: '1 0 0' }}
        {...(true ? { timeout: 3000 } : {})} ref={ref} {...props} />;
});


export const AlertDialog = memo(({ DeleteEntity, handleOpen, title, dialogMessage }: AlertDialogProps) => {
    return (
        <>
            <Dialog
                open={true}
                TransitionComponent={Transition}
                onClose={() => handleOpen()}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {dialogMessage}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleOpen()}>Cancelar</Button>
                    <Button onClick={() => DeleteEntity()} autoFocus>
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
})
