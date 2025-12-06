import { Routes, Route, Navigate } from 'react-router';
import { DrugView } from '../views/DrugView';

export const DrugRoutes = () => {
  return (
    <Routes>
      {/* <Route path='user' element={<UserView />} /> */}
      <Route path='/' element={<DrugView />} />
      <Route path='/*' element={<Navigate to="/drug/" />} />
    </Routes>
  )
}
