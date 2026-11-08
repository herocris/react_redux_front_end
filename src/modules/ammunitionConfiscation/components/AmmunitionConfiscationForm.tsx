import { useRef } from 'react';
import { getApiErrorText } from '../../../api/apiErrors';
import { Alert, Box, Button, IconButton, TextField, Zoom } from '@mui/material'
import Grid from '@mui/material/Grid2';
import {Save,Cancel,Delete} from '@mui/icons-material';
import { PhotoInput,MultipleSelectButton } from '../../../components';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { ammunitionConfiscationSchema } from '../validators';
import { AmmunitionConfiscationFormProps } from '../';

type FormFields = z.infer<typeof ammunitionConfiscationSchema>;
type FormInput = z.input<typeof ammunitionConfiscationSchema>;

export const AmmunitionConfiscationForm = ({ activeAmmunitionConfiscation, handleOpen, onSaveOrUptdate, ammunitionCollection, handleOpenDialog }: AmmunitionConfiscationFormProps) => {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
        control
    } = useForm<FormInput, unknown, FormFields>({
        defaultValues: { ...activeAmmunitionConfiscation, identificador: activeAmmunitionConfiscation.identificador?.toString() },
        resolver: zodResolver(ammunitionConfiscationSchema)
    });
    console.log(errors);

    const submitting = useRef(false);
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        if (submitting.current) return;
        submitting.current = true;
        try {
            await onSaveOrUptdate(data);
        } catch (error) {
            setError('root.server', { message: getApiErrorText(error) });
        } finally {
            submitting.current = false;
        }
    };
    return (
        <Zoom in={true} style={{ transitionDelay: '50ms' }}>
            <Box
                sx={{
                    width: '100%',
                    boxShadow: 24,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                <IconButton aria-label="Cancelar" disabled={isSubmitting} color="default" loading={false} sx={{ mb: 1, alignSelf: 'end' }} onClick={() => handleOpen(false)}>
                    <Cancel />
                </IconButton>
                {errors.root?.server && <Alert severity="error">{errors.root.server.message}</Alert>}
                <form onSubmit={(event) => {
                    if (submitting.current || isSubmitting) { event.preventDefault(); return; }
                    void handleSubmit(onSubmit)(event);
                }}>
                    <fieldset inert={isSubmitting} disabled={isSubmitting} style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
                    <Grid container sx={{ display: 'flex', alignItems: 'center', alignContent: 'center' }}>
                        <Grid size={{ xs: 12 }} sx={{ mt: 2, display: 'flex', alignItems: 'center', alignContent: 'center', gap: 2 }}>
                            <MultipleSelectButton
                                name="municion"
                                label="Arma"
                                options={ammunitionCollection}
                                control={control}
                                multiple={false}
                                error={!!errors?.municion}
                                errorMessage={errors.municion?.message}
                                sizeSmall={true}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }} sx={{ mt: 2, display: 'flex', alignItems: 'center', alignContent: 'center', gap: 2 }}>
                            <TextField
                                size="small"
                                type='number'
                                disabled={false}
                                label="Cantidad"
                                placeholder='cantidad'
                                fullWidth
                                {...register("cantidad")}
                                error={!!errors.cantidad}
                                helperText={errors.cantidad?.message}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                            <PhotoInput
                                name="foto"
                                control={control}
                                label="Subir imagen de perfil"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 12 }} sx={{ mt: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
                            <Button aria-label="Guardar" type='submit' variant='contained' loading={isSubmitting} sx={{ width: '100%' }}>
                                <Save />
                            </Button>
                            {activeAmmunitionConfiscation.identificador &&
                                <Button variant='contained' color="error" disabled={isSubmitting} loading={false} sx={{ width: '100%' }} onClick={() => handleOpenDialog()}>
                                    <Delete />
                                </Button>
                            }
                        </Grid>
                    </Grid>
                </fieldset>
                </form>
            </Box>
        </Zoom>
    )
}
