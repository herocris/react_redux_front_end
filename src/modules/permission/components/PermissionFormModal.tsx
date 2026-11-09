import Grid from '@mui/material/Grid2';
import { Button, TextField } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import type { PermissionFormModalProps } from '../types';
import { PermissionError } from './PermissionError';
import { setServerFormErrors } from '../../../helpers/setServerFormErrors';

import { permissionSchema } from '../validators';
import { FormModal } from '../../../components/FormModal';


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
            setServerFormErrors(error, setError, ['nombre', 'identificador']);
        }
    };

    return (
        <FormModal titleId="permission-title" title={activePermission.id?'Editar permiso':'Crear permiso'} busy={busy}
            onClose={() => handleOpen(false)} onSubmit={handleSubmit(onSubmit)}
            status={<><PermissionError message={errors.root?.server?.message || errorMessage} /></>}>
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
        </FormModal>
    );
}
