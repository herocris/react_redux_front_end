import {  FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Typography } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useState } from 'react';
import { PasswordFieldProps } from '../types';


export const PasswordField = ({ name, errorMessage, hasError = false, register }: PasswordFieldProps) => {
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
            <InputLabel htmlFor={name} color={hasError ? 'error' : 'info'}>Password</InputLabel>
            <OutlinedInput
                id={name}
                label="Password"
                error={hasError}
                type={showPassword ? 'text' : 'password'}
                {...register(name)}
                endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                            aria-label={
                                showPassword ? 'hide the password' : 'display the password'
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
                <Typography color="error" variant="caption">
                    {errorMessage}
                </Typography>
            )}
        </FormControl>
    )
}
