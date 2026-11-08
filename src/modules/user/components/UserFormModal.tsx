import Grid from '@mui/material/Grid2';
import { Button, TextField, Typography, Zoom, Modal, Box, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import type { UserFormModalProps, UserPermission, UserRole } from '../types';
import { UserError } from './UserError';
import { getApiErrorMessage } from '../../../api/apiErrors';

import { userSchema } from '../validators';
import { boxStyleFormModal } from '../../../helpers/boxStyle';


type FormFields = z.infer<typeof userSchema>;
export const UserFormModal = ({
    handleOpen,
    permisos,
    roles,
    loading,
    onSaveOrUptdate,
    activeUser,
    errorMessage
}: UserFormModalProps) => {
    const { register, handleSubmit, setError, formState: { errors, isSubmitting }, control } = useForm<FormFields>({
        defaultValues: { ...activeUser, permisos: activeUser.permisos ?? [], roles: activeUser.roles ?? [] }, resolver: zodResolver(userSchema)
    });

    const busy = loading || isSubmitting;
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            await onSaveOrUptdate(data);
        } catch (error) {
            const message = getApiErrorMessage(error);
            setError('root.server', { type: 'server', message: typeof message === 'string' ? message : Object.values(message).flat().join(' ') });
            if (typeof message !== 'string') {
                for (const field of ['nombre', 'correo', 'password', 'roles', 'permisos', 'identificador'] as const) {
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
                aria-labelledby="user-title"
            >
                <Box sx={boxStyleFormModal} role="dialog" aria-modal="true" aria-labelledby="user-title">
                    <Typography id='user-title' variant='h5' sx={{ mb: 1 }}>{activeUser.id?'Editar usuario':'Crear usuario'}</Typography>
                    <UserError message={errorMessage} />
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
                                    <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                                        <TextField disabled={busy} label="Email" type="text" fullWidth
                                            {...register("correo")} error={!!errors.correo} helperText={errors.correo?.message} />
                                    </Grid>
                                    <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                                        <TextField disabled={busy} label="Contraseña" type="password" fullWidth
                                            {...register("password")} error={!!errors.password} helperText={errors.password?.message} />
                                    </Grid>
                                    <Controller name="roles" control={control} render={({ field }) => (
                                        <FormControl fullWidth disabled={busy} error={!!errors.roles} sx={{ mb: 2 }}>
                                            <InputLabel id="user-roles-label">Roles</InputLabel>
                                            <Select<UserRole[]> {...field} value={field.value ?? []} multiple
                                                disabled={busy} labelId="user-roles-label" label="Roles"
                                                aria-describedby="user-roles-error"
                                                MenuProps={{ PaperProps: { style: { maxHeight: 224, width: 250 } } }}>
                                                {roles.map(option => <MenuItem key={option.value} value={option.value}>{option.description}</MenuItem>)}
                                            </Select>
                                            <FormHelperText id="user-roles-error">{errors.roles?.message}</FormHelperText>
                                        </FormControl>
                                    )} />
                                    <Controller name="permisos" control={control} render={({ field }) => (
                                        <FormControl fullWidth disabled={busy} error={!!errors.permisos} sx={{ mb: 2 }}>
                                            <InputLabel id="user-permissions-label">Permisos</InputLabel>
                                            <Select<UserPermission[]> {...field} value={field.value ?? []} multiple
                                                disabled={busy} labelId="user-permissions-label" label="Permisos"
                                                aria-describedby="user-permissions-error"
                                                MenuProps={{ PaperProps: { style: { maxHeight: 224, width: 250 } } }}>
                                                {permisos.map(option => <MenuItem key={option.value} value={option.value}>{option.description}</MenuItem>)}
                                            </Select>
                                            <FormHelperText id="user-permissions-error">{errors.permisos?.message}</FormHelperText>
                                        </FormControl>
                                    )} />
                                    <Grid size={{ xs: 12, sm: 12 }} container spacing={2} sx={{ mb: 2, mt: 2 }}>
                                        <Button type='submit' variant='contained' fullWidth loading={busy} aria-label="Guardar usuario">
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

