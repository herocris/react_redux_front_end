import { useEffect } from 'react';
import { useAppDispatch } from '../../../hooks/hooks';
import { subscribeForbidden } from '../../../api/authorizationEvents';
import { AUTHORIZATION_INTERVAL, refreshAuthorization } from '../thunks/refreshAuthorization';

// Mounted once, outside the protected subtree and its authorization revision.
export const useAuthorizationRefresh = (authenticated: boolean) => {
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (!authenticated) return;
        const refresh = (reason: 'passive' | 'interval') => {
            if (document.visibilityState === 'visible') void dispatch(refreshAuthorization(reason));
        };
        const resume = () => refresh('passive');
        const unsubscribe = subscribeForbidden(signal => {
            if (!signal.aborted) void dispatch(refreshAuthorization('forbidden'));
        });
        const timer = window.setInterval(() => refresh('interval'), AUTHORIZATION_INTERVAL);
        window.addEventListener('focus', resume);
        window.addEventListener('online', resume);
        document.addEventListener('visibilitychange', resume);
        return () => {
            unsubscribe();
            window.clearInterval(timer);
            window.removeEventListener('focus', resume);
            window.removeEventListener('online', resume);
            document.removeEventListener('visibilitychange', resume);
        };
    }, [authenticated, dispatch]);
};
