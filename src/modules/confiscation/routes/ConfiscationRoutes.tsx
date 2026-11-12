import { NotFoundPage } from '../../../router/NotFoundPage';
import { AccessRoute } from '../../../router/AccessRoute';
import { Routes, Route } from 'react-router';
import { ConfiscationsView,CreateView,EditView } from '../views';

export const ConfiscationRoutes = () => {
  return (
    <Routes>
      {/* <Route path='user' element={<UserView />} /> */}
      <Route path='/' element={<AccessRoute domain="confiscation"><ConfiscationsView/></AccessRoute>} />
      <Route path='/create' element={<AccessRoute domain="confiscation" action="create"><CreateView /></AccessRoute>} />
      <Route path='/edit/:confiscationId' element={<AccessRoute domain="confiscation" action="update"><EditView /></AccessRoute>} />
      <Route path='/detail/:confiscationId' element={<AccessRoute domain="confiscation"><EditView readOnly /></AccessRoute>} />
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  )
}
