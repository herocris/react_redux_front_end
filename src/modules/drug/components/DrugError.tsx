import { Alert } from '@mui/material';
import type { ApiErrorMessage } from '../../../api/apiErrors';

export const DrugError = ({ message }: { message: ApiErrorMessage }) => {
    const text = typeof message === 'string' ? message : Object.values(message).flat().join(' ');
    return text ? <Alert severity="error">{text}</Alert> : null;
};
