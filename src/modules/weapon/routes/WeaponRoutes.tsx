import { NotFoundPage } from '../../../router/NotFoundPage';
import { AccessRoute } from '../../../router/AccessRoute';
import { Routes, Route } from 'react-router';
import { WeaponView } from '../views';

export const WeaponRoutes = () => {
  return (
    <Routes>
      {/* <Route path='user' element={<UserView />} /> */}
      <Route path='/' element={<AccessRoute domain="weapon"><WeaponView /></AccessRoute>} />
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  )
}
