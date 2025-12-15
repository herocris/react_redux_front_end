import { Routes, Route, Navigate } from 'react-router';
import { DashBoardView } from '../views';

export const DashBoardRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<DashBoardView />} />
      <Route path='/*' element={<Navigate to="/dashboard/" />} />
    </Routes>
  )
}
