import Alert from '@mui/material/Alert';
import type { ApiErrorMessage } from '../api/apiErrors';

export const ApiErrorAlert = ({ message }: { message: ApiErrorMessage }) => {
    const text = typeof message === 'string' ? message : Object.values(message).flat().join(' ');
    return text ? <Alert severity="error">{text}</Alert> : null;
};
