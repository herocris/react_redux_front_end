import Grid from '@mui/material/Grid2';
import { Button, TextField, Typography, Zoom, Modal, Box } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import type { PermissionFormModalProps } from '../types';
import { PermissionError } from './PermissionError';
import { getApiErrorMessage } from '../../../api/apiErrors';

import { permissionSchema } from '../validators';
import { boxStyleFormModal } from '../../../helpers/boxStyle';


type FormFields = z.infer<typeof permissionSchema>;
export const PermissionFormModal = ({
    handleOpen,
     loading,
     onSaveOrUptdate,
     activePermission,
     errorMessage
    }: PermissionFormModalProps) => {
    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormFields>({
        defaultValues: activePermission, resolver: zodResolver(permissionSchema)
    });

    const busy = loading || isSubmitting;
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            await onSaveOrUptdate(data);
        } catch (error) {
            const message = getApiErrorMessage(error);
            setError('root.server', { type: 'server', message: typeof message === 'string' ? message : Object.values(message).flat().join(' ') });
            if (typeof message !== 'string') {
                for (const field of ['nombre', 'identificador'] as const) {
                    if (message[field]) setError(field, { type: 'server', message: message[field].join(' ') });
                }
            }
        }
    };

    return (
        <>
            <Modal
                open={true}
                onClose={() => {
                    if (!busy) handleOpen(false);
                }}
                aria-labelledby="permission-title"
            >
                <Box sx={boxStyleFormModal} role="dialog" aria-modal="true" aria-labelledby="permission-title">
                    <Typography id='permission-title' variant='h5' sx={{ mb: 1 }}>{activePermission.id?'Editar permiso':'Crear permiso'}</Typography>
                    <PermissionError message={errorMessage} />
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
                            <Zoom in={true} style={{ transitionDelay: '150ms' }}>
                                <Grid container>
                                    <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                                        <TextField
                                            disabled={busy}
                                            label="Nombre"
                                            placeholder='nombre'
                                            fullWidth
                                            {...register("nombre")}
                                            error={!!errors.nombre}
                                            helperText={errors.nombre?.message}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 12 }} container spacing={2} sx={{ mb: 2, mt: 2 }}>
                                        <Button type='submit' variant='contained' fullWidth loading={busy} aria-label="Guardar permiso">
                                            <SaveIcon />
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Zoom>
                        </fieldset>
                    </form>
                </Box>
            </Modal>
        </>
    );
}

