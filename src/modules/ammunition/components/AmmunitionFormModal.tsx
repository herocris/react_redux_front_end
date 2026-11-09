import Grid from '@mui/material/Grid2';
import { Button, TextField } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { AmmunitionFormModalProps } from '../types';
import { AmmunitionError } from './AmmunitionError';
import { setServerFormErrors } from '../../../helpers/setServerFormErrors';
import { SubmitHandler, useForm } from "react-hook-form";
import { ammunitionSchema } from '../validators';
import { FormModal } from '../../../components/FormModal';
import { PhotoInput } from '../../../components';



type FormFields = z.infer<typeof ammunitionSchema>;
export const AmmunitionFormModal = ({
    handleOpen,
    loading,
    onSaveOrUptdate,
    activeAmmunition,
    errorMessage
}: AmmunitionFormModalProps) => {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
        control
    } = useForm<FormFields>({
        defaultValues: activeAmmunition,
        resolver: zodResolver(ammunitionSchema)
    });

    const busy = loading || isSubmitting;
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            await onSaveOrUptdate(data);
        } catch (error) {
            setServerFormErrors(error, setError, ['descripcion', 'logo', 'identificador']);
        }
    };

    return (
        <FormModal titleId="ammunition-title" title={activeAmmunition.id ? 'Editar munición' : 'Crear munición'} busy={busy}
            onClose={() => handleOpen(false)} onSubmit={handleSubmit(onSubmit)}
            status={<><AmmunitionError message={errors.root?.server?.message || errorMessage} /></>}>
            <Grid container sx={{ alignItems: 'center', alignContent: 'center', display: 'flex' }}>
                <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                    <TextField
                        disabled={loading}
                        label="Descripción"
                        placeholder='descripcion'
                        fullWidth
                        {...register("descripcion")}
                        error={!!errors.descripcion}
                        helperText={errors.descripcion?.message}
                    />
                </Grid>

                <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                    <PhotoInput
                        name="logo"
                        control={control}
                        label="Subir imagen de perfil"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 12 }} container spacing={2} sx={{ mb: 2, mt: 2 }}>
                    <Button type='submit' variant='contained' fullWidth loading={busy} aria-label='Guardar munición'>
                        <SaveIcon />
                    </Button>
                </Grid>
            </Grid>
        </FormModal>
    );
}
