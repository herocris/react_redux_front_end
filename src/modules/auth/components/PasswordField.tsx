import {  FormControl, FormHelperText, IconButton, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useState } from 'react';
import { PasswordFieldProps } from '../types';
import type { FieldValues } from 'react-hook-form';


export const PasswordField = <T extends FieldValues,>({ name, errorMessage, hasError = false, register }: PasswordFieldProps<T>) => {
    const [showPassword, setShowPassword] = useState(false)
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };
    return (
        <FormControl sx={{ width: '100%' }} variant="outlined">
            <InputLabel htmlFor={name} color={hasError ? 'error' : 'info'}>{name === 'passwordConfirmation' ? 'Confirmar contraseña' : 'Contraseña'}</InputLabel>
            <OutlinedInput
                id={name}
                label={name === 'passwordConfirmation' ? 'Confirmar contraseña' : 'Contraseña'}
                error={hasError}
                aria-describedby={hasError ? `${name}-error` : undefined}
                type={showPassword ? 'text' : 'password'}
                {...register(name)}
                endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                            aria-label={
                                showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                            }
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            onMouseUp={handleMouseUpPassword}
                            edge="end"
                        >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                }
            />
            {hasError && (
                <FormHelperText id={`${name}-error`} error>
                    {errorMessage}
                </FormHelperText>
            )}
        </FormControl>
    )
}
