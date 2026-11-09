import { MultipleSelectButton } from '../../../components/MultipleSelectButton';
import { PermissionOptionsStatus } from '../../permission/components/PermissionOptionsStatus';
import Grid from '@mui/material/Grid2';
import { Button, TextField } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import type { RoleFormModalProps } from '../types';
import { RoleError } from './RoleError';
import { setServerFormErrors } from '../../../helpers/setServerFormErrors';

import { roleSchema } from '../validators';
import { FormModal } from '../../../components/FormModal';


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
            setServerFormErrors(error, setError, ['nombre', 'permisos', 'identificador']);
        }
    };

    return (
        <FormModal titleId="role-title" title={activeRole.id?'Editar rol':'Crear rol'} busy={busy}
            onClose={() => handleOpen(false)} onSubmit={handleSubmit(onSubmit)}
            status={<><RoleError message={errors.root?.server?.message || errorMessage} />
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
                <MultipleSelectButton name="permisos" control={control} label="Permisos"
                    options={permisos} multiple disabled={busy || optionsUnavailable} />
                <Grid size={{ xs: 12, sm: 12 }} container spacing={2} sx={{ mb: 2, mt: 2 }}>
                    <Button disabled={optionsUnavailable} type='submit' variant='contained' fullWidth loading={busy} aria-label="Guardar rol">
                        <SaveIcon />
                    </Button>
                </Grid>
            </Grid>
        </FormModal>
    );
}
