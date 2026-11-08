import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Grid from '@mui/material/Grid2';
import { Button, TextField, Typography, Zoom } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { WeaponFormModalProps } from '../types';
import { WeaponError } from './WeaponError';
import { getApiErrorMessage } from '../../../api/apiErrors';
import { SubmitHandler, useForm } from "react-hook-form";
import { weaponSchema } from '../validators';
import { boxStyleFormModal } from '../../../helpers/boxStyle';
import { PhotoInput } from '../../../components';



type FormFields = z.infer<typeof weaponSchema>;
export const WeaponFormModal = ({
    handleOpen,
     loading,
     onSaveOrUptdate,
     activeWeapon,
     errorMessage
    }: WeaponFormModalProps) => {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
        control
    } = useForm<FormFields>({
        defaultValues: activeWeapon,
        resolver: zodResolver(weaponSchema)
    });

    const busy = loading || isSubmitting;
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            await onSaveOrUptdate(data);
        } catch (error) {
            const message = getApiErrorMessage(error);
            setError('root.server', { type: 'server', message: typeof message === 'string' ? message : Object.values(message).flat().join(' ') });
            if (typeof message !== 'string') {
                for (const field of ['descripcion', 'logo', 'identificador'] as const) {
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
                aria-labelledby="weapon-title"
            >
                <Box sx={boxStyleFormModal} role="dialog" aria-modal="true" aria-labelledby="weapon-title">
                    <Typography id='weapon-title' variant='h5' sx={{ mb: 1 }}>{activeWeapon.id?'Editar arma':'Crear arma'}</Typography>
                    <WeaponError message={errorMessage} />
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
                        <Zoom in={true} style={{ transitionDelay: '150ms' }}>
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
                                    <Button type='submit' variant='contained' fullWidth loading={busy} aria-label='Guardar arma'>
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

