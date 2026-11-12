import { useAppSelector } from '../../../hooks/hooks';
import { selectSessionUser, selectAuthStatus } from '../selectors';
import { canAccess, type AccessDomain } from '../access';

export const useAccess = (domain: AccessDomain) => {
    const user = useAppSelector(selectSessionUser);
    const authenticated = useAppSelector(selectAuthStatus) === 'authenticated';
    return {
        view: authenticated && canAccess(user, domain),
        create: authenticated && canAccess(user, domain, 'create'),
        update: authenticated && canAccess(user, domain, 'update'),
        delete: authenticated && canAccess(user, domain, 'delete'),
    };
};
