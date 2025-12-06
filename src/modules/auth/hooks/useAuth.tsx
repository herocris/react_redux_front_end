import { RootState } from '../../../store';
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { startCreatingUserWithEmailPassword, startLoginWithEmailPassword } from '../thunks';
import { LoginData,RegisterData } from '../';

export const useAuth = () => {
    const { errorMessage } = useAppSelector((state: RootState) => state.auth);
    const dispatch = useAppDispatch();
    
    const onLogin = async (data:LoginData)=>{
        dispatch(startLoginWithEmailPassword(data));
    }
    const onRegister = async (data:RegisterData)=>{
        dispatch(startCreatingUserWithEmailPassword(data));
    }
    return {
        onLogin,
        onRegister,
        errorMessage
    }
}
