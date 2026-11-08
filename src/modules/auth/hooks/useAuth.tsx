import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { startCreatingUserWithEmailPassword, startLoginWithEmailPassword } from '../thunks';
import type { LoginData,RegisterData } from '../types';
import { selectAuthError } from '../selectors';

export const useAuth = () => {
    const errorMessage = useAppSelector(selectAuthError);
    const dispatch = useAppDispatch();
    
    const onLogin = async (data:LoginData)=>{
        await dispatch(startLoginWithEmailPassword(data));
    }
    const onRegister = async (data:RegisterData)=>{
        await dispatch(startCreatingUserWithEmailPassword(data));
    }
    return {
        onLogin,
        onRegister,
        errorMessage
    }
}
