import { useEffect } from 'react';
import Grid from '@mui/material/Grid2';
import { Box, Button, TextField, Typography, Zoom, Modal } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserFormModalProps, User } from '../';
import { SubmitHandler, useForm } from "react-hook-form";
import { MultipleSelectButton } from '../../../components';
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
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, },
        control,
        reset
    } = useForm<FormFields>({
        defaultValues: activeUser, resolver: zodResolver(userSchema)
    });

    const onSubmit: SubmitHandler<User> = async (data) => {
        console.log(data);
        await onSaveOrUptdate(data)
    };

    useEffect(() => {
        if (typeof errorMessage === 'object') {
            for (const formValue of Object.keys(errorMessage)) {
                setError(formValue as keyof FormFields, {
                    message: (errorMessage as Record<string, string[]>)[formValue].toString()
                });
            }
        }
    }, [errorMessage]);


    return (
        <>
            <Modal
                open={true}
                onClose={() => {
                    handleOpen(false)
                    reset()
                }}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={boxStyleFormModal}>
                    <Typography variant='h5' sx={{ mb: 1 }}>{activeUser.id ? 'Editar Usuario' : 'Crear Usuario'}</Typography>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Zoom in={true} style={{ transitionDelay: '150ms' }}>
                            <Grid container>
                                <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                                    <TextField
                                        disabled={loading}
                                        label="Nombre"
                                        placeholder='nombre'
                                        fullWidth
                                        {...register("nombre")}
                                        error={!!errors.nombre}
                                        helperText={errors.nombre?.message}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                                    <TextField
                                        disabled={loading}
                                        label="Email"
                                        placeholder='email'
                                        fullWidth
                                        {...register("correo")}
                                        error={!!errors.correo}
                                        helperText={errors.correo?.message}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                                    <TextField
                                        disabled={loading}
                                        label="Contraseña"
                                        type="password"
                                        placeholder='Contraseña'
                                        fullWidth
                                        {...register("password")}
                                        error={!!errors.password}
                                        helperText={errors.password?.message}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                                    <MultipleSelectButton
                                        name="roles"
                                        label="Roles"
                                        options={roles}
                                        control={control}
                                        multiple={true}
                                    />
                                </Grid>
                                <MultipleSelectButton
                                    name="permisos"
                                    label="Permisos"
                                    options={permisos}
                                    control={control}
                                    multiple={true}
                                />
                                <Grid size={{ xs: 12, sm: 12 }} container spacing={2} sx={{ mb: 2, mt: 2 }}>
                                    <Button type='submit' variant='contained' fullWidth loading={loading}>
                                        <SaveIcon />
                                    </Button>
                                </Grid>
                            </Grid>
                        </Zoom>
                    </form>
                </Box>
            </Modal>
        </>
    );
}

