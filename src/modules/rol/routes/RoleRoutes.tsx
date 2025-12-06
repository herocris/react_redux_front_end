import { Routes, Route, Navigate } from 'react-router';
import { RoleView } from '../views';

export const RoleRoutes = () => {
  return (
    <Routes>
      {/* <Route path='user' element={<UserView />} /> */}
      <Route path='/' element={<RoleView />} />
      <Route path='/*' element={<Navigate to="/role/" />} />
    </Routes>
  )
}
