import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './routes/Login';
import DashboardLayout from './routes/DashboardLayout';
import NewAudits from './routes/NewAudits';
import ManageAudits from './routes/ManageAudits';
import AuditDetail from './routes/AuditDetail';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <NewAudits /> },
      { path: 'manage', element: <ManageAudits /> },
      { path: 'audit/:id', element: <AuditDetail /> }
    ]
  }
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}