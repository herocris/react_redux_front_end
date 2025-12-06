
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
    const [defaultValue, _setdefaultValue] = useState({
        email: 'cris_itg@yahoo.es',
        password: 'password'
    })

    const { errorMessage, onLogin } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors, },
    } = useForm<FormFields>({
        defaultValues: defaultValue, resolver: zodResolver(authLoginSchema)
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        onLogin(data);
    }
    
    return (
        <AuthLayout title="Login">
            <form onSubmit={handleSubmit(onSubmit)} >
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
                        {errorMessage as String}
                    </Typography>
                    <Grid size={{ xs: 12, sm: 12 }} container spacing={2} sx={{ mb: 2, mt: 2 }}>
                        <Button variant='contained' fullWidth type="submit">
                            Login
                        </Button>
                    </Grid>
                    <Grid container direction='row' justifyContent='end'>
                        <Typography sx={{ mr: 1 }}>¿No tienes cuenta?</Typography>
                        <Typography component={Link} color='info' to="/auth/register">
                            Registrar
                        </Typography>
                    </Grid>
                </Grid>
            </form>
        </AuthLayout>
    )
}