import { Routes, Route, Navigate } from 'react-router';
import { UserView } from '../views/UserView';

export const UserRoutes = () => {

  return (
    <Routes>
      {/* <Route path='user' element={<UserView />} /> */}
      <Route path='/' element={<UserView />} />
      <Route path='/*' element={<Navigate to="/user/" />} />
    </Routes>
  )
}
