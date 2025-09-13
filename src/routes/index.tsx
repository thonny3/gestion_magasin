import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import NotFound from '../components/layout/NotFound';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import PublicRoute from '../components/auth/PublicRoute';
import LoginPage from '../components/auth/LoginPage';
import { routeConfig } from '../config/routes';

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
    children: routeConfig.filter(route => route.path !== '/login'),
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
