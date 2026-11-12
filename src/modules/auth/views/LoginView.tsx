
import { Button, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { AuthLayout } from '../layout';
import { Link } from 'react-router';
import { authLoginSchema } from '../validators';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SubmitHandler, useForm } from 'react-hook-form';
import { useState } from 'react';
import { PasswordField } from '../components';
import { useAuth } from '../hooks';

type FormFields = z.infer<typeof authLoginSchema>;
export const LoginView = () => {
    const [defaultValue] = useState({
        email: 'cris_itg@yahoo.es',
        password: 'password'
    })

    const { errorMessage, onLogin } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormFields>({
        defaultValues: defaultValue, resolver: zodResolver(authLoginSchema)
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        await onLogin(data);
    }
    
    return (
        <AuthLayout title="Decomisos">
            <Typography color="text.secondary">Gestión y análisis de decomisos</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>Demostración con acceso precargado. Los registros pueden incluir datos de ejemplo.</Typography>
            <form onSubmit={handleSubmit(onSubmit)} aria-busy={isSubmitting}>
                <fieldset disabled={isSubmitting} aria-label="Acceso" style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
                <Grid container>
                    <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                        <TextField
                            label="Correo"
                            type="email"
                            placeholder='correo@google.com'
                            fullWidth
                            {...register("email")}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                        <PasswordField name='password' register={register} errorMessage={errors.password?.message} hasError={!!errors.password} />
                    </Grid>
                    <Typography color="error" variant="h6">
                        {typeof errorMessage === 'string' ? errorMessage : undefined}
                    </Typography>
                    <Grid size={{ xs: 12, sm: 12 }} container spacing={2} sx={{ mb: 2, mt: 2 }}>
                        <Button variant='contained' fullWidth type="submit" loading={isSubmitting}>
                            Iniciar sesión
                        </Button>
                    </Grid>
                    <Grid container direction='row' justifyContent='end'>
                        <Typography sx={{ mr: 1 }}>¿No tienes cuenta?</Typography>
                        <Typography component={Link} color='info' to="/auth/register">
                            Registrar
                        </Typography>
                        <Typography sx={{ mr: 1 }}>Documentación de la API:</Typography>
                        <a href="https://crisdemo.xyz/api/documentation" target="_blank" rel="noopener noreferrer" style={{ color: '#298aebff' }}>Consultar API</a>
                    </Grid>
                </Grid>
                </fieldset>
            </form>
        </AuthLayout>
    )
}
