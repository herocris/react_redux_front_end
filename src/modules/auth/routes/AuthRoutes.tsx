import { Routes, Route, Navigate } from 'react-router';
import { RegisterView, LoginView } from '../views';
import { useAppSelector } from '../../../hooks/hooks';
import { selectAuthStatus } from '../selectors';
import { SessionLanding } from '../../../router/AccessRoute';
import { NotFoundPage } from '../../../router/NotFoundPage';

export const AuthRoutes = () => {
  const authenticated = useAppSelector(selectAuthStatus) === 'authenticated';
  return (
    <Routes>
      <Route index element={authenticated ? <SessionLanding /> : <Navigate to="/auth/login" replace />} />
      <Route path='login' element={authenticated ? <SessionLanding /> : <LoginView />} />
      <Route path='register' element={authenticated ? <SessionLanding /> : <RegisterView />} />
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  );
};
