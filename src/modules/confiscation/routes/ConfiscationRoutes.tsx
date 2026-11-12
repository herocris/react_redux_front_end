import { AccessRoute } from '../../../router/AccessRoute';
import { Routes, Route, Navigate } from 'react-router';
import { ConfiscationsView,CreateView,EditView } from '../views';

export const ConfiscationRoutes = () => {
  return (
    <Routes>
      {/* <Route path='user' element={<UserView />} /> */}
      <Route path='/' element={<ConfiscationsView/>} />
      <Route path='/create' element={<AccessRoute domain="confiscation" action="create"><CreateView /></AccessRoute>} />
      <Route path='/edit/:confiscationId' element={<AccessRoute domain="confiscation" action="update"><EditView /></AccessRoute>} />
      <Route path='/detail/:confiscationId' element={<EditView readOnly />} />
      <Route path='/*' element={<Navigate to="/confiscation/" />} />
    </Routes>
  )
}
