import { NotFoundPage } from '../../../router/NotFoundPage';
import { AccessRoute } from '../../../router/AccessRoute';
import { Routes, Route } from 'react-router';
import { PermissionView } from '../views';

export const PermissionRoutes = () => {
  return (
    <Routes>
      {/* <Route path='user' element={<UserView />} /> */}
      <Route path='/' element={<AccessRoute domain="permission"><PermissionView/></AccessRoute>} />
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  )
}
