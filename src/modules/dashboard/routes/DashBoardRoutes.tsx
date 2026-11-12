import { NotFoundPage } from '../../../router/NotFoundPage';
import { AccessRoute } from '../../../router/AccessRoute';
import { Routes, Route } from 'react-router';
import { DashBoardView } from '../views';

export const DashBoardRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<AccessRoute domain="dashboard"><DashBoardView /></AccessRoute>} />
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  )
}
