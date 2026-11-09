import { MultipleSelectButton } from '../../../components/MultipleSelectButton';
import { PermissionOptionsStatus } from '../../permission/components/PermissionOptionsStatus';
import Grid from '@mui/material/Grid2';
import { Button, TextField } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import type { UserFormModalProps } from '../types';
import { UserError } from './UserError';
import { setServerFormErrors } from '../../../helpers/setServerFormErrors';

import { userSchema } from '../validators';
import { FormModal } from '../../../components/FormModal';


type FormFields = z.infer<typeof userSchema>;
export const UserFormModal = ({
    permissionOptionsStatus,
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
    const optionsUnavailable = permissionOptionsStatus.pending || !!permissionOptionsStatus.error;
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        if (optionsUnavailable) return;
        try {
            await onSaveOrUptdate(data);
        } catch (error) {
            setServerFormErrors(error, setError, ['nombre', 'correo', 'password', 'roles', 'permisos', 'identificador']);
        }
    };

    return (
        <FormModal titleId="user-title" title={activeUser.id?'Editar usuario':'Crear usuario'} busy={busy}
            onClose={() => handleOpen(false)} onSubmit={handleSubmit(onSubmit)}
            status={<><UserError message={errors.root?.server?.message || errorMessage} />
                    <PermissionOptionsStatus {...permissionOptionsStatus} /></>}>
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
                <MultipleSelectButton name="roles" control={control} label="Roles"
                    options={roles} multiple disabled={busy} />
                <MultipleSelectButton name="permisos" control={control} label="Permisos"
                    options={permisos} multiple disabled={busy || optionsUnavailable} />
                <Grid size={{ xs: 12, sm: 12 }} container spacing={2} sx={{ mb: 2, mt: 2 }}>
                    <Button disabled={optionsUnavailable} type='submit' variant='contained' fullWidth loading={busy} aria-label="Guardar usuario">
                        <SaveIcon />
                    </Button>
                </Grid>
            </Grid>
        </FormModal>
    );
}
