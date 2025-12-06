import { Button, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { AuthLayout } from '../layout';
import { Link } from 'react-router';
import { useAuth } from '../hooks';
import { authRegisterSchema } from '../validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { SubmitHandler, useForm } from 'react-hook-form';
import { PasswordField } from '../components';


const formData = {
    name: '',
    email: '',
    password: '',
    passwordConfirmation: ''
}

type FormFields = z.infer<typeof authRegisterSchema>;
export const RegisterView = () => {
    const { errorMessage, onRegister } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors, },
    } = useForm<FormFields>({
        defaultValues: formData, resolver: zodResolver(authRegisterSchema)
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        onRegister(data);
    }
    return (
        <AuthLayout title="Register">
            <form onSubmit={handleSubmit(onSubmit)} >
                <Grid container>
                    <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                        <TextField
                            label="Nombre"
                            placeholder='nombre'
                            fullWidth
                            {...register("name")}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                        <TextField
                            label="Correo"
                            type="email"
                            placeholder='correo@google.com'
                            fullWidth
                            {...register("email")}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                        <PasswordField name='password' register={register} errorMessage={errors.password?.message} hasError={!!errors.password} />
                    </Grid>
                    <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                        <PasswordField name='passwordConfirmation' register={register} errorMessage={errors.passwordConfirmation?.message} hasError={!!errors.passwordConfirmation} />
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
                        <Typography sx={{ mr: 1 }}>¿Ya tienes cuenta?</Typography>
                        <Typography component={Link} color='info' to="/auth/login">
                            Ingresar
                        </Typography>
                    </Grid>
                </Grid>
            </form>
        </AuthLayout>
    )
}