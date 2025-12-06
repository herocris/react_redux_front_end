import { Routes, Route, Navigate } from 'react-router';
import { ActivityView } from '../views';

export const ActivityRoutes = () => {
  return (
    <Routes>
      {/* <Route path='user' element={<UserView />} /> */}
      <Route path='/' element={<ActivityView/>} />
      <Route path='/*' element={<Navigate to="/actividad/" />} />
    </Routes>
  )
}
