import { PermissionOptionsStatus } from '../../permission/components/PermissionOptionsStatus';
import Grid from '@mui/material/Grid2';
import { Button, TextField, Typography, Zoom, Modal, Box, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import type { RoleFormModalProps, RolePermission } from '../types';
import { RoleError } from './RoleError';
import { getApiErrorMessage } from '../../../api/apiErrors';

import { roleSchema } from '../validators';
import { boxStyleFormModal } from '../../../helpers/boxStyle';


type FormFields = z.infer<typeof roleSchema>;
export const RoleFormModal = ({
    permissionOptionsStatus,
    handleOpen,
     permisos,
     loading,
     onSaveOrUptdate,
     activeRole,
     errorMessage
    }: RoleFormModalProps) => {
    const { register, handleSubmit, setError, formState: { errors, isSubmitting }, control } = useForm<FormFields>({
        defaultValues: { ...activeRole, permisos: activeRole.permisos ?? [] }, resolver: zodResolver(roleSchema)
    });

    const busy = loading || isSubmitting;
    const optionsUnavailable = permissionOptionsStatus.pending || !!permissionOptionsStatus.error;
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        if (optionsUnavailable) return;
        try {
            await onSaveOrUptdate(data);
        } catch (error) {
            const message = getApiErrorMessage(error);
            setError('root.server', { type: 'server', message: typeof message === 'string' ? message : Object.values(message).flat().join(' ') });
            if (typeof message !== 'string') {
                for (const field of ['nombre', 'permisos', 'identificador'] as const) {
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
                aria-labelledby="role-title"
            >
                <Box sx={boxStyleFormModal} role="dialog" aria-modal="true" aria-labelledby="role-title">
                    <Typography id='role-title' variant='h5' sx={{ mb: 1 }}>{activeRole.id?'Editar rol':'Crear rol'}</Typography>
                    <RoleError message={errorMessage} />
                    <PermissionOptionsStatus {...permissionOptionsStatus} />
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
                                    <Controller name="permisos" control={control} render={({ field }) => (
                                        <FormControl fullWidth disabled={busy} error={!!errors.permisos} sx={{ mb: 2 }}>
                                            <InputLabel id="role-permissions-label">Permisos</InputLabel>
                                            <Select<RolePermission[]> {...field} value={field.value ?? []} multiple
                                                disabled={busy || optionsUnavailable} labelId="role-permissions-label" label="Permisos"
                                                aria-describedby="role-permissions-error"
                                                MenuProps={{ PaperProps: { style: { maxHeight: 224, width: 250 } } }}>
                                                {permisos.map(option => <MenuItem key={option.value} value={option.value}>{option.description}</MenuItem>)}
                                            </Select>
                                            <FormHelperText id="role-permissions-error">{errors.permisos?.message}</FormHelperText>
                                        </FormControl>
                                    )} />
                                    <Grid size={{ xs: 12, sm: 12 }} container spacing={2} sx={{ mb: 2, mt: 2 }}>
                                        <Button disabled={optionsUnavailable} type='submit' variant='contained' fullWidth loading={busy} aria-label="Guardar rol">
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

