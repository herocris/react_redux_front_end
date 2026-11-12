import { NotFoundPage } from '../../../router/NotFoundPage';
import { AccessRoute } from '../../../router/AccessRoute';
import { Routes, Route } from 'react-router';
import { AmmunitionView } from '../views';

export const AmmunitionRoutes = () => {
  return (
    <Routes>
      {/* <Route path='user' element={<UserView />} /> */}
      <Route path='/' element={<AccessRoute domain="ammunition"><AmmunitionView/></AccessRoute>} />
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  )
}
