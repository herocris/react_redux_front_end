import { Box, Button, IconButton, TextField, Zoom } from '@mui/material'
import Grid from '@mui/material/Grid2';
import  {Save,Cancel,Delete } from '@mui/icons-material';
import { PhotoInput,MultipleSelectButton } from '../../../components';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { weaponConfiscationSchema } from '../validators';
import { WeaponConfiscationFormProps } from '../';

type FormFields = z.infer<typeof weaponConfiscationSchema>;
export const WeaponConfiscationForm = ({ activeWeaponConfiscation, handleOpen, onSaveOrUptdate, weaponCollection, handleOpenDialog }: WeaponConfiscationFormProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors, },
        control
    } = useForm<FormFields>({
        defaultValues: { ...activeWeaponConfiscation, identificador: activeWeaponConfiscation.identificador?.toString() },
        resolver: zodResolver(weaponConfiscationSchema)
    });
    console.log(errors);

    const onSubmit: SubmitHandler<z.infer<typeof weaponConfiscationSchema>> = async (data) => {
        console.log(data);
        onSaveOrUptdate(data)
        handleOpen(false)
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
                <IconButton color="default" loading={false} sx={{ mb: 1, alignSelf: 'end' }} onClick={() => handleOpen(false)}>
                    <Cancel/>
                </IconButton>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container sx={{ display: 'flex', alignItems: 'center', alignContent: 'center' }}>
                        <Grid size={{ xs: 12 }} sx={{ mt: 2, display: 'flex', alignItems: 'center', alignContent: 'center', gap: 2 }}>
                            <MultipleSelectButton
                                name="arma"
                                label="Arma"
                                options={weaponCollection}
                                control={control}
                                multiple={false}
                                error={!!errors?.arma}
                                errorMessage={errors.arma?.message}
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
                            <Button type='submit' variant='contained' loading={false} sx={{ width: '100%' }}>
                                <Save/>
                            </Button>
                            {activeWeaponConfiscation.identificador &&
                                <Button variant='contained' color="error" loading={false} sx={{ width: '100%' }} onClick={() => handleOpenDialog()}>
                                    <Delete/>
                                </Button>
                            }
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Zoom>
    )
}
