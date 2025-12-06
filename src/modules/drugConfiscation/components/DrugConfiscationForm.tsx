import { Box, Button, IconButton, TextField, Zoom } from '@mui/material'
import Grid from '@mui/material/Grid2';
import  {Save,Cancel,Delete } from '@mui/icons-material';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { drugConfiscationSchema } from '../validators';
import { MultipleSelectButton,PhotoInput } from '../../../components';
import { memo } from 'react';
import { DrugConfiscationFormProps } from '../';

type FormFields = z.infer<typeof drugConfiscationSchema>;

export const DrugConfiscationForm = memo(({ activeDrugConfiscation, handleOpen, onSaveOrUptdate, drugCollection, drugPresentationCollection, handleOpenDialog }: DrugConfiscationFormProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors, },
        control
    } = useForm<FormFields>({
        defaultValues: { ...activeDrugConfiscation, identificador: activeDrugConfiscation.identificador?.toString() },
        resolver: zodResolver(drugConfiscationSchema)
    });
    console.log(activeDrugConfiscation);

    const onSubmit: SubmitHandler<z.infer<typeof drugConfiscationSchema>> = async (data) => {
        console.log(data);
        onSaveOrUptdate(data)
        handleOpen(false)
    };
    console.log('carga formulario');
    
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
                <IconButton color="default" loading={false} sx={{ mb: 1, alignSelf: 'end' }} onClick={() => handleOpen(false)}>
                    <Cancel />
                </IconButton>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container sx={{ display: 'flex', alignItems: 'center', alignContent: 'center' }}>
                        <Grid size={{ xs: 12 }} container spacing={2} sx={{ mt: 0, display: 'flex', alignItems: 'center', alignContent: 'center', gap: 2 }}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <MultipleSelectButton
                                    name="droga"
                                    label="Droga"
                                    options={drugCollection}
                                    control={control}
                                    multiple={false}
                                    error={!!errors?.droga}
                                    errorMessage={errors.droga?.message}
                                    sizeSmall={true}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <MultipleSelectButton
                                    name="presentacion"
                                    label="Presentación"
                                    options={drugPresentationCollection}
                                    control={control}
                                    multiple={false}
                                    error={!!errors?.presentacion}
                                    errorMessage={errors.presentacion?.message}
                                    sizeSmall={true}
                                />
                            </Grid>
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
                            <TextField
                                size="small"
                                type='number'
                                disabled={false}
                                label="Peso"
                                placeholder='peso'
                                fullWidth
                                {...register("peso")}
                                error={!!errors.peso}
                                helperText={errors.peso?.message}
                                slotProps={{
                                    htmlInput: { step: "any" }, // 👈 permite decimales // step="0.01" para limitar a dos decimales
                                }}
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
                            <Button type='submit' variant='contained' loading={false} sx={{ width: '100%' }}>
                                <Save />
                            </Button>
                            {activeDrugConfiscation.identificador &&
                                <Button variant='contained' color="error" loading={false} sx={{ width: '100%' }} onClick={() => handleOpenDialog()}>
                                    <Delete />
                                </Button>
                            }
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Zoom>
    )
}
)