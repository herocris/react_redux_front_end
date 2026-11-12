import { NotFoundPage } from '../../../router/NotFoundPage';
import { AccessRoute } from '../../../router/AccessRoute';
import { Routes, Route } from 'react-router';
import { DrugView } from '../views/DrugView';

export const DrugRoutes = () => {
  return (
    <Routes>
      {/* <Route path='user' element={<UserView />} /> */}
      <Route path='/' element={<AccessRoute domain="drug"><DrugView /></AccessRoute>} />
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  )
}
